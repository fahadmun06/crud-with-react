import React, { useState } from 'react'
import { Button, Col, DatePicker, Divider, Form, Image, Input, Progress, Row, Typography, message } from 'antd'
import { Link } from 'react-router-dom'
import { setDoc, doc } from "firebase/firestore";
import { firestore, storage } from 'config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useAuthContext } from 'contexts/AuthContext';

const { Title } = Typography

const initialState = { title: "", location: "", date: "", description: "" }

export default function Hero() {

  const { user } = useAuthContext()
  const [state, setState] = useState(initialState)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))
  const handleDate = (_, date) => setState(s => ({ ...s, date }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    let { title, location, date, description } = state

    if (!title) { return message.error("Please enter title") }

    const todo = {
      title, location, date, description,
      status: "active",
      dateCreated: new Date().getTime(),
      id: Math.random().toString(36).slice(2),
      file: "",
      createdBy: {
        fullName: user.fullName,
        email: user.email,
        uid: user.uid,
      }
    }

    setIsProcessing(true)

    if (file) {
      if (file.size > 500000) {
        setIsProcessing(false)
        return message.error("Your file size greater than 500 KB")
      }
      uploadFile(todo)
    } else {
      createDocument(todo)
    }
  }

  const createDocument = async (todo) => {
    try {
      await setDoc(doc(firestore, "todos", todo.id), todo);
      console.log('todo.id', todo.id)
      message.success("A new todo added successfully")
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setIsProcessing(false)
  }

  const uploadFile = (todo) => {

    const fileName = todo.id
    var fileExtension = file.name.split('.').pop();

    const storageRef = ref(storage, `images/${fileName}.${fileExtension}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(Math.floor(progress))
      },
      (error) => {
        message.error("Something went wrong while uploading file")
        // Handle unsuccessful uploads
        setIsProcessing(false)
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          let data = { ...todo, file: downloadURL }
          createDocument(data)
        });
      }
    );
  }

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col">
            <Link to="/" className='btn btn-primary mb-5'>Go Home</Link>
            <div className="card p-3 p-md-4">
              <Title level={2} className='m-0 text-center'>Add Todo</Title>

              <Divider />

              <Form layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Title">
                      <Input placeholder='Input your title' name='title' onChange={handleChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Location">
                      <Input placeholder='Input your location' name='location' onChange={handleChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Form.Item label="Date">
                      <DatePicker className='w-100' onChange={handleDate} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} lg={8}>
                    <Form.Item label="Image">
                      <Input type='file' placeholder='Upload picture' onChange={e => { setFile(e.target.files[0]) }} />
                    </Form.Item>
                    {isProcessing && file && <Progress percent={progress} showInfo={false} />}
                  </Col>
                  <Col xs={12} lg={4}>
                    <Form.Item label="Preview">
                      {file && <Image src={URL.createObjectURL(file)} style={{ width: 50, height: 50 }} />}
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Description">
                      <Input.TextArea placeholder='Input your description' name='description' onChange={handleChange} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={{ span: 12, offset: 6 }} lg={{ span: 8, offset: 8 }} >
                    <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleSubmit}>Add Todo</Button>
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
