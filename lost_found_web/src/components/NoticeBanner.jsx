import React, { useState, useEffect } from 'react'
import { Card, Badge, Collapse, Tag } from 'antd'
import { BellOutlined } from '@ant-design/icons'
import axios from 'axios'
import dayjs from 'dayjs'

export default function NoticeBanner() {
  const [notices, setNotices] = useState([])

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const res = await axios.get('/api/notices')
      setNotices(res.data || [])
    } catch {}
  }

  if (notices.length === 0) return null

  return (
    <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <BellOutlined style={{ fontSize: 20, color: '#52c41a', marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <Collapse
            ghost
            items={notices.map((n, i) => ({
              key: i,
              label: <span style={{ fontWeight: 500 }}>{n.title}</span>,
              children: (
                <div>
                  <p>{n.content}</p>
                  <span style={{ color: '#999', fontSize: 12 }}>{dayjs(n.createdTime).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              )
            }))}
          />
        </div>
      </div>
    </Card>
  )
}
