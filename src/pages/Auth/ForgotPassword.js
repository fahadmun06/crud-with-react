import React, { useState } from 'react'
import { Button, Divider, Form, Input, Typography, message } from 'antd'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from 'config/firebase'

const { Title } = Typography

export default function ForgotPassword() {
  const [state, setState] = useState({ email: "" })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleChange = e => setState(s => ({ ...s, [e.target.name]: e.target.value }))

  const handleForgotPassword = e => {
    e.preventDefault()

    let { email } = state

    setIsProcessing(true)
    sendPasswordResetEmail(auth, email, { url: "http://localhost:3000/auth/login" })
      .then(() => {
        message.success("Please check your mail box")
      })
      .catch(err => {
        message.error("Something went wrong while sending password reset email")
        console.error(err)
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }

  return (
    <main className='auth'>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="card p-3 p-md-4">
              <Title level={2} className='m-0 text-center'>Forgot Password</Title>

              <Divider />

              <Form layout="vertical">
                <Form.Item label="Email">
                  <Input placeholder='Input your email' name='email' onChange={handleChange} />
                </Form.Item>

                <Button type='primary' htmlType='submit' className='w-100' loading={isProcessing} onClick={handleForgotPassword}>Submit</Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
