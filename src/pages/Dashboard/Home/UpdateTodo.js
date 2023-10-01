import React, { useCallback, useEffect, useState } from 'react'
import { Button, Col, DatePicker, Divider, Form, Input, Row, Select, Typography, message } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { firestore } from 'config/firebase'

const { Title } = Typography

const initialState = { title: "", location: "", date: "", status: "", description: "" }

export default function UpdateTodo() {

  const [state, setState] = useState(initialState)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()
  const params = useParams()

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))
  const handleDate = (_, date) => setState(s => ({ ...s, date }))

  const getDocument = useCallback(async () => {

    const docRef = doc(firestore, "todos", params.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const todo = docSnap.data()
      setState(todo)
    } else {
      // docSnap.data() will be undefined in this case
      message.error("Todo not found")
    }
  }, [params.id])

  useEffect(() => {
    getDocument()
  }, [getDocument])

  const handleSubmit = async (e) => {
    e.preventDefault()
    let { title, location, date, description, status } = state

    if (!title) { return message.error("Please enter title") }

    const todo = {
      ...state,
      title, location, date, description, status,
      dateModified: new Date().getTime(),
    }

    setIsProcessing(true)
    try {
      await setDoc(doc(firestore, "todos", todo.id), todo);
      message.success("Todo updated successfully")
      navigate("/")
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setIsProcessing(false)
  }
  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card p-3 p-md-4">
              <Title level={2} className='m-0 text-center'>Update Todo</Title>

              <Divider />

              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Title">
                      <Input placeholder='Input your title' name='title' value={state.title} onChange={handleChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Location">
                      <Input placeholder='Input your location' name='location' value={state.location} onChange={handleChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Date">
                      <DatePicker className='w-100' value={state.date ? dayjs(state.date) : ""} onChange={handleDate} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Status">
                      <Select value={state.status} onChange={status => setState(s => ({ ...s, status }))}>
                        {["active", "inactive"].map((status, i) => {
                          return <Select.Option key={i} value={status}>{status}</Select.Option>
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Description">
                      <Input.TextArea placeholder='Input your description' name='description' value={state.description} onChange={handleChange} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                    <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleSubmit}>Update Todo</Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
