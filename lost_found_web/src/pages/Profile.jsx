import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, message, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import axios from 'axios'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
      form.setFieldsValue(JSON.parse(userInfo))
    }
  }, [form])

  const handleUpdate = async (values) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/users/profile', values, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updatedUser = { ...user, ...values }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      message.success('更新成功')
    } catch (err) {
      message.error(err.response?.data?.message || '更新失败')
    }
    setLoading(false)
  }

  const handlePasswordChange = async (values) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put('/api/users/password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      message.success('密码修改成功')
    } catch (err) {
      message.error(err.response?.data?.message || '修改失败')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card title="个人信息" bordered={false}>
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="username" label="学号/工号">
            <Input disabled />
          </Form.Item>
          <Form.Item name="realName" label="真实姓名">
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item name="college" label="学院">
            <Input placeholder="请输入学院" />
          </Form.Item>
          <Form.Item name="phoneNumber" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item name="wxId" label="微信">
            <Input placeholder="请输入微信号" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>保存修改</Button>
              <Button danger onClick={handleLogout}>退出登录</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="修改密码" bordered={false}>
        <Form onFinish={handlePasswordChange} layout="vertical">
          <Form.Item name="oldPassword" label="原密码" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">修改密码</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
