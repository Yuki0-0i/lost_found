import React, { useState, useEffect } from 'react'
import { Card, List, Tag, Button, Space, Badge, Empty, message } from 'antd'
import { BellOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/messages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMessages(res.data)
    } catch {
      message.error('获取消息失败')
    }
    setLoading(false)
  }

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/messages/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setMessages(messages.map(m => m.id === id ? { ...m, isRead: true } : m))
    } catch {}
  }

  const getTypeTag = (type) => {
    switch (type) {
      case 'CLAIM_APPLY': return <Tag color="blue">认领申请</Tag>
      case 'CLAIM_RESULT': return <Tag color="green">认领结果</Tag>
      default: return <Tag>系统通知</Tag>
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card title={<Space><BellOutlined /> 我的消息</Space>}>
        <List
          loading={loading}
          dataSource={messages}
          locale={{ emptyText: <Empty description="暂无消息" /> }}
          renderItem={item => (
            <List.Item
              onClick={() => !item.isRead && markAsRead(item.id)}
              style={{ background: item.isRead ? 'transparent' : '#f0f0f0', cursor: 'pointer' }}
              extra={!item.isRead && <Button size="small">标记已读</Button>}
            >
              <List.Item.Meta
                avatar={
                  item.type === 'CLAIM_RESULT'
                    ? <CheckCircleOutlined style={{ fontSize: 24, color: item.content?.includes('通过') ? '#52c41a' : '#ff4d4f' }} />
                    : <BellOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                }
                title={
                  <Space>
                    {getTypeTag(item.type)}
                    {item.isRead ? '' : <Tag color="red">未读</Tag>}
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
      </Card>
    </div>
  )
}
