import React, { useEffect, useState } from 'react'
import { Avatar, Button, Col, DatePicker, Divider, Form, Image, Input, Modal, Row, Select, Space, Tooltip, message } from 'antd'
import { DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons"
import dayjs from 'dayjs'
import { Link, useNavigate } from 'react-router-dom'
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { firestore } from 'config/firebase'
import { useAuthContext } from 'contexts/AuthContext'

export default function Hero() {

  const { user } = useAuthContext()
  const [allDocuments, setAllDocuments] = useState([])
  const [documents, setDocuments] = useState([])
  const [status, SetStatus] = useState("active")
  const [todo, setTodo] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setTodo(s => ({ ...s, [e.target.name]: e.target.value }))
  const handleDate = (_, date) => setTodo(s => ({ ...s, date }))

  const getTodos = async () => {

    const q = query(collection(firestore, "todos"), where("createdBy.uid", "==", user.uid))

    const querySnapshot = await getDocs(q);
    const array = []
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      let data = doc.data()
      array.push(data)
    });
    setAllDocuments(array)
    setDocuments(array)
  }

  useEffect(() => {
    getTodos()
  }, [])

  useEffect(() => {
    const filteredDocuments = allDocuments.filter(todo => todo.status === status)
    setDocuments(filteredDocuments)
  }, [allDocuments, status])

  // const handleEdit = (todo) => {
  //   console.log('todo', todo)
  //   setTodo(todo)
  //   setIsModalOpen(true)
  // }
  const handleUpdate = () => {
    let { title, location, date, description } = todo

    if (!title) { return message.error("Please enter title") }

    const updatedTodo = {
      title, location, date, description,
      dateModified: new Date().getTime()
    }

    const updatedTodos = documents.map(oldTodo => {
      if (oldTodo.id === todo.id)
        return updatedTodo
      return oldTodo
    })

    setDocuments(updatedTodos)
    localStorage.setItem("todos", JSON.stringify(updatedTodos))
    message.success("Todo updated successfully")
    setIsModalOpen(false)
  }

  const handleDelete = async (todo) => {

    try {
      await deleteDoc(doc(firestore, "todos", todo.id));

      let documentsAfterDelete = documents.filter(doc => doc.id !== todo.id)
      setAllDocuments(documentsAfterDelete)
      setDocuments(documentsAfterDelete)

      message.success("Todo deleted successfully")
    } catch (err) {
      console.error(err)
      message.error("something went wrong while delting todo")
    }
  }

  return (
    <>
      <div className='py-5'>
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <h1>Todos</h1>
              <Select placeholder="Select status" onChange={status => SetStatus(status)}>
                {["active", "inactive"].map((status, i) => {
                  return <Select.Option key={i} value={status}>{status}</Select.Option>
                })}
              </Select>
            </div>
          </div>
          <Divider />

          <div className="row">
            <div className="col">
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((todo, i) => {
                      return (
                        <tr key={i}>
                          <th>{i + 1}</th>
                          <td>{todo.file ? <Image src={todo.file} className='rounded-circle' style={{ width: 50 }} /> : <Avatar size={50} icon={<UserOutlined />} />}</td>
                          <td><Link to={`/details/${todo.id}`}>{todo.title}</Link></td>
                          <td>{todo.location}</td>
                          <td>{todo.description}</td>
                          <td>{todo.date ? dayjs(todo.date).format("dddd, DD/MM/YYYY") : ""}</td>
                          <td>{todo.status}</td>
                          <td>
                            <Space>
                              <Tooltip title="Delete" color='red'><Button danger icon={<DeleteOutlined />} onClick={() => { handleDelete(todo) }} /></Tooltip>
                              <Tooltip title="Edit"><Button type="primary" icon={<EditOutlined />} onClick={() => { navigate(`/dashboard/todos/${todo.id}`) }} /></Tooltip>
                            </Space>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Update Todo"
        centered
        open={isModalOpen}
        onOk={handleUpdate}
        okText="Confirm"
        cancelText="Close"
        onCancel={() => setIsModalOpen(false)}
        style={{ width: 1000, maxWidth: 1000 }}
      >
        <Form layout="vertical" className='py-4'>
          <Row gutter={16}>
            <Col xs={24} lg={8}>
              <Form.Item label="Title">
                <Input placeholder='Input your title' name='title' value={todo.title} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Location">
                <Input placeholder='Input your location' name='location' value={todo.location} onChange={handleChange} />
              </Form.Item>
            </Col>
            <Col xs={24} lg={8}>
              <Form.Item label="Date">
                <DatePicker className='w-100' value={todo.date ? dayjs(todo.date) : ""} onChange={handleDate} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Description" className='mb-0'>
                <Input.TextArea placeholder='Input your description' name='description' value={todo.description} onChange={handleChange} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}
