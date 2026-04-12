import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd'
import { AppstoreOutlined, PlusOutlined, UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined, CommentOutlined } from '@ant-design/icons'
import ItemList from './pages/ItemList'
import ItemPublish from './pages/ItemPublish'
import ItemDetail from './pages/ItemDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Feedback from './pages/Feedback'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

const { Header, Content, Footer } = Layout

function getAvatarColor(name) {
  const colors = ['#f56a00', '#7265e6', '#00a2ae', '#ffbf00', '#00afc8', '#87d068', '#ff4d4f']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function AppContent() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const menuItems = [
    { key: '1', label: <Link to="/">物品列表</Link>, icon: <AppstoreOutlined /> },
    { key: '2', label: <Link to="/publish">发布物品</Link>, icon: <PlusOutlined /> },
    { key: '3', label: <Link to="/feedback">意见反馈</Link>, icon: <CommentOutlined /> }
  ]

  const userMenu = {
    items: [
      { key: 'profile', label: <Link to="/profile">个人中心</Link>, icon: <UserOutlined /> },
      { key: 'messages', label: <Link to="/messages">我的消息</Link>, icon: <BellOutlined /> },
      ...(user?.role === 'ADMIN' ? [{ key: 'admin', label: <Link to="/admin">管理后台</Link>, icon: <SettingOutlined /> }] : []),
      { type: 'divider' },
      { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout()
    }
  }

  const isAuthPage = location.pathname === '/login'
  const displayName = user?.realName || user?.username || ''

  return (
    <Layout className="layout">
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="logo">失物招领</div>
        {!isAuthPage && (
          <>
            <Menu mode="horizontal" theme="dark" items={menuItems} style={{ flex: 1, marginLeft: 20 }} />
            <div style={{ marginLeft: 'auto' }}>
              {user ? (
                <Dropdown menu={userMenu} placement="bottomRight">
                  <Button type="text" style={{ color: '#fff' }}>
                    <Avatar size="small" style={{ backgroundColor: getAvatarColor(displayName) }}>
                      {displayName ? displayName[0].toUpperCase() : 'U'}
                    </Avatar>
                    <span style={{ marginLeft: 8 }}>{displayName}</span>
                  </Button>
                </Dropdown>
              ) : (
                <Link to="/login">
                  <Button type="primary">登录</Button>
                </Link>
              )}
            </div>
          </>
        )}
      </Header>
      <Content style={{ padding: '20px 50px', minHeight: 'calc(100vh - 134px)' }}>
        <Routes>
          <Route path="/" element={<ItemList />} />
          <Route path="/detail/:id" element={<ItemDetail />} />
          <Route path="/publish" element={user ? <ItemPublish /> : <Navigate to="/login" />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/messages" element={user ? <Messages /> : <Navigate to="/login" />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin" element={(user?.role === 'ADMIN') ? <AdminDashboard /> : <Navigate to="/" />} />
        </Routes>
      </Content>
      <Footer style={{ textAlign: 'center' }}>失物招领系统 ©{new Date().getFullYear()}</Footer>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
