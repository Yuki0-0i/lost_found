import React, { useState, useEffect } from 'react'
import { Card, Button, Space, Tag, message, Modal, Form, Input, Tabs, List, Avatar, Empty } from 'antd'
import { EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [claims, setClaims] = useState([])
  const [applyModal, setApplyModal] = useState(false)
  const [claimForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('detail')
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      const res = await axios.get(`/api/items/${id}`)
      setItem(res.data)
    } catch {
      message.error('获取详情失败')
      navigate('/')
    }
  }

  const fetchClaims = async () => {
    try {
      const res = await axios.get(`/api/claims/item/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setClaims(res.data)
    } catch {
      // 可能无权查看
    }
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    if (key === 'claims') fetchClaims()
  }

  const handleApply = async (values) => {
    try {
      await axios.post('/api/claims', {
        itemId: parseInt(id),
        verifyInfo: values.verifyInfo,
        message: values.message
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      message.success('申请已提交，请等待发布人审核')
      setApplyModal(false)
      claimForm.resetFields()
    } catch (err) {
      message.error(err.response?.data?.message || '申请失败')
    }
  }

  const handleApprove = async (claimId) => {
    try {
      await axios.put(`/api/claims/${claimId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      message.success('已同意认领')
      fetchClaims()
      fetchItem()
    } catch {
      message.error('操作失败')
    }
  }

  const handleReject = async (claimId) => {
    Modal.confirm({
      title: '拒绝认领',
      content: <Input.TextArea id="reject-reason" placeholder="请输入拒绝原因" rows={3} />,
      onOk: async () => {
        const reason = document.getElementById('reject-reason')?.value || '不符合'
        try {
          await axios.put(`/api/claims/${claimId}/reject`, { reason }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          message.success('已拒绝')
          fetchClaims()
        } catch {
          message.error('操作失败')
        }
      }
    })
  }

  const isOwner = currentUser.role === 'ADMIN' || currentUser.id === item?.userId
  const canApply = currentUser.id && !isOwner && item?.type === 'FOUND' && !item?.isResolved

  if (!item) return null

  const tabItems = [
    { key: 'detail', label: '物品详情' },
    ...(isOwner ? [{ key: 'claims', label: '认领申请' }] : [])
  ]

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card
        cover={item.images && <img alt={item.name} src={item.images} style={{ maxHeight: 400, objectFit: 'contain' }} />}
        actions={[
          canApply && <Button type="primary" onClick={() => setApplyModal(true)}>我要认领</Button>,
          !currentUser.id && <Button onClick={() => navigate('/login')}>登录后认领</Button>
        ].filter(Boolean)}
      >
        <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />

        {activeTab === 'detail' && (
          <div>
            <h2>
              <Tag className={item.type === 'LOST' ? 'tag-lost' : 'tag-found'} style={{ marginRight: 8 }}>
                {item.type === 'LOST' ? '寻物启事' : '失物招领'}
              </Tag>
              {item.name}
              {item.isResolved && <Tag color="default" style={{ marginLeft: 8 }}>已解决</Tag>}
            </h2>
            <p><strong>分类：</strong>{item.category || '其他'}</p>
            <p><strong>描述：</strong>{item.description || '无'}</p>
            <p><EnvironmentOutlined /> <strong>地点：</strong>{item.location}</p>
            <p><strong>存放地点：</strong>{item.storageLocation || '暂无'}</p>
            <p><PhoneOutlined /> <strong>联系方式：</strong>{item.contactInfo}</p>
            <p><ClockCircleOutlined /> <strong>时间：</strong>{item.foundTime?.replace('T', ' ').substring(0, 16) || '未知'}</p>
            <p><strong>发布时间：</strong>{item.createdTime?.replace('T', ' ').substring(0, 16) || '未知'}</p>
          </div>
        )}

        {activeTab === 'claims' && (
          <List
            dataSource={claims}
            locale={{ emptyText: <Empty description="暂无认领申请" /> }}
            renderItem={claim => (
              <List.Item
                actions={[
                  claim.status === 'PENDING' && <>
                    <Button type="link" onClick={() => handleApprove(claim.id)}>同意</Button>
                    <Button type="link" danger onClick={() => handleReject(claim.id)}>拒绝</Button>
                  </>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      申请人 #{claim.userId}
                      <Tag color={
                        claim.status === 'APPROVED' ? 'green' :
                        claim.status === 'REJECTED' ? 'red' : 'orange'
                      }>
                        {claim.status === 'PENDING' ? '待审核' : claim.status === 'APPROVED' ? '已同意' : '已拒绝'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <p><strong>验证信息：</strong>{claim.verifyInfo}</p>
                      {claim.message && <p><strong>留言：</strong>{claim.message}</p>}
                      {claim.rejectReason && <p style={{ color: 'red' }}><strong>拒绝原因：</strong>{claim.rejectReason}</p>}
                      <p style={{ color: '#999' }}>申请时间：{dayjs(claim.createdTime).format('YYYY-MM-DD HH:mm')}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal title="申请认领" open={applyModal} onCancel={() => setApplyModal(false)} footer={null}>
        <Form form={claimForm} onFinish={handleApply} layout="vertical">
          <Form.Item name="verifyInfo" label="物品验证信息" rules={[{ required: true, message: '请填写验证信息' }]}>
            <TextArea rows={3} placeholder="请描述物品特征以证明您是失主，如：钱包里有多少钱、有什么证件" />
          </Form.Item>
          <Form.Item name="message" label="留言（选填）">
            <TextArea rows={2} placeholder="可以补充一些信息" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">提交申请</Button>
              <Button onClick={() => setApplyModal(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
