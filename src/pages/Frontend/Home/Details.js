import React, { useCallback, useEffect, useState } from 'react'
import { Divider } from 'antd'
import { useParams } from 'react-router-dom'
import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from 'config/firebase'

export default function Details() {

    const [todo, setTodo] = useState({})
    const params = useParams()

    const getTodo = useCallback(async () => {
        
        onSnapshot(doc(firestore, "todos", params.id), (doc) => {
            const data = doc.data()
            setTodo(data)
            console.log('todo', data)
        })
    }, [params.id])

    useEffect(() => {
        getTodo()
    }, [getTodo])

    return (
        <main className='py-5'>
            <div className="container">
                <div className="row">
                    <div className="col text-center">
                        <h1>{todo.title}</h1>
                    </div>
                </div>
                <Divider />

                <div className="row">
                    <div className="col">
                    </div>
                </div>
            </div>
        </main>
    )
}
