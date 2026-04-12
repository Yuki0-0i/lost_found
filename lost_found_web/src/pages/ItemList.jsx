import React, { useState, useEffect } from 'react'
import { Card, Tag, Button, Space, message, Empty, Spin, Tabs, Modal, Form, Input, Select, DatePicker, Row, Col } from 'antd'
import { EnvironmentOutlined, ClockCircleOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getItems, deleteItem, updateItem } from '../api'
import NoticeBanner from '../components/NoticeBanner'
import dayjs from 'dayjs'

const { TextArea } = Input

const CATEGORIES = ['全部', '饰品', '文具', '电子设备', '证件', '衣物', '钱包', '背包', '其他']
const CAMPUS_LOCATIONS = ['全部', '图书馆', '教学楼A栋', '教学楼B栋', '食堂一楼', '食堂二楼', '食堂三楼', '体育馆', '操场', '女生宿舍楼', '男生宿舍楼', '自习室', '其他']

export default function ItemList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [editItem, setEditItem] = useState(null)
  const [editForm] = Form.useForm()
  const [filters, setFilters] = useState({ category: '全部', location: '全部', status: '全部', keyword: '' })
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  const fetchItems = async () => {
    setLoading(true)
    try {
      let data
      if (activeTab === 'my') {
        const res = await fetch('/api/items/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        data = res.ok ? await res.json() : []
      } else {
        const res = await getItems()
        data = res.data || []
      }

      // 前端筛选
      if (filters.category && filters.category !== '全部') {
        data = data.filter(i => i.category === filters.category)
      }
      if (filters.location && filters.location !== '全部') {
        data = data.filter(i => i.location === filters.location)
      }
      if (filters.status === 'resolved') {
        data = data.filter(i => i.isResolved)
      } else if (filters.status === 'pending') {
        data = data.filter(i => !i.isResolved)
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase()
        data = data.filter(i => i.name?.toLowerCase().includes(kw) || i.description?.toLowerCase().includes(kw))
      }

      setItems(data)
    } catch {
      message.error('获取数据失败')
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [activeTab, filters])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteItem(id)
      message.success('删除成功')
      fetchItems()
    } catch (err) {
      message.error(err.response?.data?.message || '删除失败')
    }
  }

  const handleEdit = (item, e) => {
    e.stopPropagation()
    setEditItem(item)
    editForm.setFieldsValue({ ...item, foundTime: item.foundTime ? dayjs(item.foundTime) : null })
  }

  const handleUpdate = async (values) => {
    try {
      await updateItem(editItem.id, { ...values, foundTime: values.foundTime?.format('YYYY-MM-DDTHH:mm:ss') })
      message.success('更新成功')
      setEditItem(null)
      fetchItems()
    } catch {
      message.error('更新失败')
    }
  }

  const canModify = (item) => currentUser.role === 'ADMIN' || currentUser.id === item.userId

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'lost', label: '寻物启事' },
    { key: 'found', label: '失物招领' },
    { key: 'my', label: '我的发布' }
  ]

  const handleTabChange = (key) => {
    setActiveTab(key)
    setFilters({ category: '全部', location: '全部', status: '全部', keyword: '' })
  }

  const clearFilters = () => {
    setFilters({ category: '全部', location: '全部', status: '全部', keyword: '' })
  }

  const displayItems = items.filter(item => {
    if (activeTab === 'lost' && item.type !== 'LOST') return false
    if (activeTab === 'found' && item.type !== 'FOUND') return false
    if (activeTab === 'my' && item.userId !== currentUser.id && currentUser.role !== 'ADMIN') return false
    return true
  })

  return (
    <div>
      <NoticeBanner />
      <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 16 }} />

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select style={{ width: '100%' }} placeholder="物品分类"
              value={filters.category} onChange={v => setFilters({ ...filters, category: v })}>
              {CATEGORIES.map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select style={{ width: '100%' }} placeholder="地点"
              value={filters.location} onChange={v => setFilters({ ...filters, location: v })}>
              {CAMPUS_LOCATIONS.map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select style={{ width: '100%' }} placeholder="状态"
              value={filters.status} onChange={v => setFilters({ ...filters, status: v })}>
              <Select.Option value="全部">全部</Select.Option>
              <Select.Option value="pending">待认领</Select.Option>
              <Select.Option value="resolved">已解决</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input.Search placeholder="关键词搜索" allowClear
              value={filters.keyword} onChange={e => setFilters({ ...filters, keyword: e.target.value })}
              onSearch={() => fetchItems()} enterButton={<SearchOutlined />} />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button icon={<ClearOutlined />} onClick={clearFilters} block>重置</Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {displayItems.length === 0 ? (
          <Empty description={activeTab === 'my' ? '您还没有发布物品' : '暂无数据'} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {displayItems.map(item => (
              <Card key={item.id} className="item-card" hoverable clickable
                onClick={() => navigate(`/detail/${item.id}`)}
                cover={item.images && <img alt={item.name} src={item.images} style={{ height: 180, objectFit: 'cover' }} />}>
                <Card.Meta
                  title={
                    <Space>
                      <Tag className={item.type === 'LOST' ? 'tag-lost' : 'tag-found'}>
                        {item.type === 'LOST' ? '寻物' : '招领'}
                      </Tag>
                      <span style={{ cursor: 'pointer' }}>{item.name}</span>
                      {item.isResolved && <Tag color="default">已解决</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <p><strong>分类：</strong>{item.category || '其他'}</p>
                      <p>{item.description}</p>
                      <p><EnvironmentOutlined /> {item.location}</p>
                      <p><strong>存放：</strong>{item.storageLocation || '暂无'}</p>
                      <p><ClockCircleOutlined /> {item.foundTime?.replace('T', ' ').substring(0, 16) || '未知'}</p>
                      {canModify(item) && (
                        <Space style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
                          <Button size="small" icon={<EditOutlined />} onClick={(e) => handleEdit(item, e)}>编辑</Button>
                          <Button danger size="small" icon={<DeleteOutlined />} onClick={(e) => handleDelete(item.id, e)}>删除</Button>
                        </Space>
                      )}
                    </div>
                  }
                />
              </Card>
            ))}
          </div>
        )}
      </Spin>

      <Modal title="编辑物品" open={!!editItem} onCancel={() => setEditItem(null)} footer={null}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="LOST">寻物启事</Select.Option>
              <Select.Option value="FOUND">失物招领</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="物品分类" rules={[{ required: true }]}>
            <Select>{CATEGORIES.filter(c => c !== '全部').map(c => <Select.Option key={c} value={c}>{c}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="name" label="物品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="物品描述">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="location" label="地点" rules={[{ required: true }]}>
            <Select showSearch>{CAMPUS_LOCATIONS.filter(l => l !== '全部').map(l => <Select.Option key={l} value={l}>{l}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item name="foundTime" label="时间">
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="storageLocation" label="存放地点">
            <Input />
          </Form.Item>
          <Form.Item name="contactInfo" label="联系方式" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="images" label="图片URL">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setEditItem(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
