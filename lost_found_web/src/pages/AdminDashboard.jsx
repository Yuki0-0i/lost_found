import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Modal, Form, Input, message, Tabs, List, Avatar } from 'antd'
import { UserOutlined, DeleteOutlined, PlusOutlined, BarChartOutlined, CommentOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [notices, setNotices] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [noticeModal, setNoticeModal] = useState(false)
  const [noticeForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('users')

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    else if (activeTab === 'items') fetchItems()
    else if (activeTab === 'claims') fetchClaims()
    else if (activeTab === 'notices') fetchNotices()
    else if (activeTab === 'feedbacks') fetchFeedbacks()
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setUsers(res.data)
    } catch {}
  }

  const fetchItems = async () => {
    try {
      const res = await axios.get('/api/items')
      setItems(res.data)
    } catch {}
  }

  const fetchClaims = async () => {
    try {
      const res = await axios.get('/api/admin/claims', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setClaims(res.data)
    } catch {}
  }

  const fetchNotices = async () => {
    try {
      const res = await axios.get('/api/notices')
      setNotices(res.data)
    } catch {}
  }

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/api/feedbacks/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setFeedbacks(res.data)
    } catch {}
  }

  const handleDeleteUser = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await axios.delete(`/api/admin/users/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          message.success('删除成功')
          fetchUsers()
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  const handleDeleteItem = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个物品吗？',
      onOk: async () => {
        try {
          await axios.delete(`/api/items/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          message.success('删除成功')
          fetchItems()
        } catch {
          message.error('删除失败')
        }
      }
    })
  }

  const handleCreateNotice = async (values) => {
    try {
      await axios.post('/api/notices', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      message.success('发布成功')
      setNoticeModal(false)
      noticeForm.resetFields()
      fetchNotices()
    } catch {
      message.error('发布失败')
    }
  }

  const handleDeleteNotice = async (id) => {
    try {
      await axios.delete(`/api/notices/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      message.success('删除成功')
      fetchNotices()
    } catch {
      message.error('删除失败')
    }
  }

  const tabItems = [
    { key: 'users', label: <><UserOutlined /> 用户管理</> },
    { key: 'items', label: <><DeleteOutlined /> 物品管理</> },
    { key: 'claims', label: <><BarChartOutlined /> 认领管理</> },
    { key: 'notices', label: <><PlusOutlined /> 公告管理</> },
    { key: 'feedbacks', label: <><CommentOutlined /> 反馈管理</> }
  ]

  const userColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'realName', key: 'realName' },
    { title: '学院', dataIndex: 'college', key: 'college' },
    { title: '角色', dataIndex: 'role', key: 'role', render: role => <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>{role}</Tag> },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button danger size="small" onClick={() => handleDeleteUser(record.id)}>删除</Button>
    )}
  ]

  const itemColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'LOST' ? 'red' : 'green'}>{type}</Tag> },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '状态', dataIndex: 'isResolved', key: 'isResolved', render: r => <Tag color={r ? 'gray' : 'blue'}>{r ? '已解决' : '待认领'}</Tag> },
    { title: '发布者ID', dataIndex: 'userId', key: 'userId' },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button danger size="small" onClick={() => handleDeleteItem(record.id)}>删除</Button>
    )}
  ]

  return (
    <div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'users' && <Table dataSource={users} columns={userColumns} rowKey="id" />}
      {activeTab === 'items' && <Table dataSource={items} columns={itemColumns} rowKey="id" />}
      {activeTab === 'claims' && (
        <List
          dataSource={claims}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={`物品 #${item.itemId} - 申请人 #${item.userId}`}
                description={
                  <div>
                    <p>验证信息：{item.verifyInfo}</p>
                    <p>状态：<Tag color={item.status === 'APPROVED' ? 'green' : item.status === 'REJECTED' ? 'red' : 'orange'}>{item.status}</Tag></p>
                    <p>申请时间：{dayjs(item.createdTime).format('YYYY-MM-DD HH:mm')}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      {activeTab === 'notices' && (
        <>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setNoticeModal(true)} style={{ marginBottom: 16 }}>
            发布公告
          </Button>
          <List
            dataSource={notices}
            renderItem={item => (
              <List.Item
                actions={[<Button danger size="small" onClick={() => handleDeleteNotice(item.id)}>删除</Button>]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={
                    <div>
                      <p>{item.content}</p>
                      <p style={{ color: '#999' }}>{dayjs(item.createdTime).format('YYYY-MM-DD HH:mm')}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
      {activeTab === 'feedbacks' && (
        <List
          dataSource={feedbacks}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar icon={<CommentOutlined />} />}
                title={
                  <Space>
                    {item.type === 'bug' ? <Tag color="red">Bug反馈</Tag> : item.type === 'suggestion' ? <Tag color="blue">功能建议</Tag> : <Tag>其他</Tag>}
                    <span>用户 #{item.userId}</span>
                    {item.contact && <span style={{ color: '#999' }}>联系方式: {item.contact}</span>}
                  </Space>
                }
                description={
                  <div>
                    <p>{item.content}</p>
                    <p style={{ color: '#999', fontSize: 12 }}>{dayjs(item.createdTime).format('YYYY-MM-DD HH:mm')}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      <Modal title="发布公告" open={noticeModal} onCancel={() => setNoticeModal(false)} footer={null}>
        <Form form={noticeForm} onFinish={handleCreateNotice} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="公告标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="公告内容" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">发布</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
