import React from 'react'
import { Form, Input, Select, DatePicker, Button, message, Card, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { createItem } from '../api'

const { TextArea } = Input

const CATEGORIES = [
  '饰品', '文具', '电子设备', '证件', '衣物', '钱包', '背包', '其他'
]

const CAMPUS_LOCATIONS = [
  '图书馆', '教学楼A栋', '教学楼B栋', '食堂一楼', '食堂二楼', '食堂三楼',
  '体育馆', '操场', '女生宿舍楼', '男生宿舍楼', '自习室', '其他'
]

export default function ItemPublish() {
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    try {
      const data = {
        ...values,
        foundTime: values.foundTime?.format('YYYY-MM-DDTHH:mm:ss')
      }
      await createItem(data)
      message.success('发布成功')
      form.resetFields()
      navigate('/')
    } catch (err) {
      message.error(err.response?.data?.message || '发布失败，请先登录')
    }
  }

  return (
    <div className="publish-form">
      <Card title="发布物品信息" bordered={false}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型">
              <Select.Option value="FOUND">我捡到了物品（失物招领）</Select.Option>
              <Select.Option value="LOST">我丢失了物品（寻物启事）</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="category" label="物品分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="请选择物品分类">
              {CATEGORIES.map(cat => <Select.Option key={cat} value={cat}>{cat}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="name" label="物品名称" rules={[{ required: true, message: '请输入物品名称' }]}>
            <Input placeholder="如：黑色钱包、校园卡、无线耳机" />
          </Form.Item>

          <Form.Item name="description" label="物品描述">
            <TextArea rows={3} placeholder="详细描述物品特征（颜色、品牌、特征等）" />
          </Form.Item>

          <Form.Item name="location" label="丢失/捡到地点" rules={[{ required: true, message: '请输入地点' }]}>
            <Select showSearch placeholder="请选择或输入地点" allowClear>
              {CAMPUS_LOCATIONS.map(loc => <Select.Option key={loc} value={loc}>{loc}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="foundTime" label="丢失/捡到时间" rules={[{ required: true, message: '请选择时间' }]}>
            <DatePicker showTime style={{ width: '100%' }} placeholder="请选择时间" />
          </Form.Item>

          <Form.Item name="storageLocation" label="物品存放地点" rules={[{ required: true, message: '请输入存放地点' }]}>
            <Input placeholder="如：图书馆前台、宿管阿姨处" />
          </Form.Item>

          <Form.Item name="contactInfo" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
            <Input placeholder="手机号或微信" />
          </Form.Item>

          <Form.Item name="images" label="物品图片URL（可选）">
            <Input placeholder="输入图片链接，如：https://xxx.com/image.jpg" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">发布</Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
