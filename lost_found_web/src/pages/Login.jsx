import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const { TabPane } = Tabs

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  const navigate = useNavigate()

  const onLogin = async (values) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      message.success('登录成功')
      navigate('/')
      window.location.reload()
    } catch (err) {
      message.error(err.response?.data?.message || '登录失败')
    }
    setLoading(false)
  }

  const onRegister = async (values) => {
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      message.success('注册成功')
      navigate('/')
      window.location.reload()
    } catch (err) {
      message.error(err.response?.data?.message || '注册失败')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card title="失物招领系统" style={{ width: 400 }} bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="登录" key="login">
            <Form onFinish={onLogin} layout="vertical">
              <Form.Item name="username" rules={[{ required: true, message: '请输入学号/工号' }]}>
                <Input prefix={<UserOutlined />} placeholder="学号/工号" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="注册" key="register">
            <Form onFinish={onRegister} layout="vertical">
              <Form.Item name="username" label="学号/工号" rules={[{ required: true, message: '请输入学号/工号' }]}>
                <Input placeholder="请输入学号/工号" />
              </Form.Item>
              <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              <Form.Item name="confirmPassword" label="确认密码"
                rules={[{ required: true, message: '请确认密码' }, ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次密码不一致'))
                  },
                })]}>
                <Input.Password placeholder="请确认密码" />
              </Form.Item>
              <Form.Item name="realName" label="真实姓名">
                <Input placeholder="请输入真实姓名（选填）" />
              </Form.Item>
              <Form.Item name="college" label="学院">
                <Input placeholder="请输入学院（选填）" />
              </Form.Item>
              <Form.Item name="phoneNumber" label="手机号">
                <Input placeholder="请输入手机号（选填）" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block size="large">
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}
