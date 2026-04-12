import React, { useState } from 'react'
import { Card, Form, Input, Select, Button, message, Space } from 'antd'
import { BugOutlined, CommentOutlined, SendOutlined } from '@ant-design/icons'
import axios from 'axios'

const { TextArea } = Input

export default function Feedback() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await axios.post('/api/feedbacks', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      message.success('反馈已提交，感谢您的建议！')
      form.resetFields()
    } catch {
      message.error('提交失败，请重试')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title={<Space><CommentOutlined /> 意见反馈</Space>}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="反馈类型" rules={[{ required: true, message: '请选择反馈类型' }]}>
            <Select placeholder="请选择">
              <Select.Option value="bug"><BugOutlined /> 功能问题/Bug</Select.Option>
              <Select.Option value="suggestion"><CommentOutlined /> 功能建议</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="content" label="反馈内容" rules={[{ required: true, message: '请输入反馈内容' }]}>
            <TextArea rows={5} placeholder="请详细描述您遇到的问题或建议..." />
          </Form.Item>

          <Form.Item name="contact" label="联系方式（选填）">
            <Input placeholder="手机号或邮箱，方便我们联系您" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" icon={<SendOutlined />} htmlType="submit" loading={loading}>
              提交反馈
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
