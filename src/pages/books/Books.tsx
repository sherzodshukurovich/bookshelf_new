import React, {useEffect, useState} from 'react';
import './books.scss'
import {Button, Form, Input, Modal, Spin, Select,InputNumber } from 'antd';
import axios from "axios";
import {BOOKSHELF_KEY, BOOKSHELF_SECRET, BOOKSHELF_URL} from "../../const";
import {MD5} from 'crypto-js'
import {DeletedBookToast, EditedToast, ErrorDataToast, ErrorToast, SuccessToast} from "../../components/AllToasts";


const {Search} = Input;

function Books() {
    // ================ start Modal ========================

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [allbooks, setAllBooks] = useState([])
    const [deleteId, setDeleteId] = useState([])
    const [loading, setLoading] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const showModalEdit = () => {
        setIsModalOpenEdit(true);
    };
    const showModalDelete = () => {
        setIsModalOpenDelete(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const handleEdit = () => {
        setIsModalOpenEdit(false);
    };
    const handleDelete = () => {
        setIsModalOpenDelete(false);
    };
    // ========= end Modal =============================
    // ========= start form ===========================


    const onFinish = async (values: any) => {
        let newValues={
            'isbn':values.isbn.toString()
        }
        try {
            await axios.post(BOOKSHELF_URL + 'books', newValues, {
                headers: {
                    Key: localStorage.getItem(BOOKSHELF_KEY),
                    Sign: MD5('POST' + '/books' + JSON.stringify(newValues) + localStorage.getItem(BOOKSHELF_SECRET)),
                },
            });
            SuccessToast();
            getAllBooks();
            handleCancel();
        } catch (error) {
            ErrorToast();
        }
    };

    const handleChange = async (value: string) => {
        const newValue = { status: parseInt(value) };
        try {
            await axios.patch(BOOKSHELF_URL + `books/${deleteId}`, newValue, {
                headers: {
                    Key: localStorage.getItem(BOOKSHELF_KEY),
                    Sign: MD5('PATCH' + `/books/${deleteId}` + JSON.stringify(newValue) + localStorage.getItem(BOOKSHELF_SECRET)),
                },
            });
            EditedToast();
            getAllBooks();
            handleEdit();
        } catch (error) {
            ErrorToast();
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        ErrorDataToast();
    };

    const getAllBooks = async () => {
        setLoading(true);
        try {
            const resp = await axios.get(BOOKSHELF_URL + 'books', {
                headers: {
                    Key: localStorage.getItem(BOOKSHELF_KEY),
                    Sign: MD5('GET' + '/books' + localStorage.getItem(BOOKSHELF_SECRET)),
                },
            });
            setAllBooks(resp.data.data);
            console.log(resp.data.data);
        } catch (error) {
            ErrorToast();
        }
        setLoading(false);
    };

    const deletedBook = async () => {
        if (deleteId) {
            try {
                await axios.delete(BOOKSHELF_URL + `books/${deleteId}`, {
                    headers: {
                        Key: localStorage.getItem(BOOKSHELF_KEY),
                        Sign: MD5('DELETE' + `/books/${deleteId}` + localStorage.getItem(BOOKSHELF_SECRET)),
                    },
                });
                DeletedBookToast();
                getAllBooks();
                handleDelete();
            } catch (error) {
                ErrorToast();
            }
        }
    };

    const onSearch = async (value: string) => {
        setLoading(true);
        try {
            const resp = await axios.get(BOOKSHELF_URL + `books/${value}`, {
                headers: {
                    Key: localStorage.getItem(BOOKSHELF_KEY),
                    Sign: MD5('GET' + `/books/${value}` + localStorage.getItem(BOOKSHELF_SECRET)),
                },
            });
            setAllBooks(resp.data.data);
            setLoading(false);
        } catch (error) {
            getAllBooks();
            ErrorToast();
        }
    };

    const generateStatus = (id: any) => {
        if (id === 0) {
            return 'new';
        } else if (id === 1) {
            return 'reading';
        } else {
            return 'finished';
        }
    };



    return (
        <div>
            <div className="books-page">
                <div className="books-search">
                    <Search size="large" placeholder=" Search ..." onSearch={onSearch}/>
                </div>
                <div className="cards">
                    {
                        allbooks?.map((item: any, index) => (
                            <div className="card">
                                <div className="card-img">
                                    <img
                                        src={item.book ? item.book?.cover ? item.book.cover : '/media/icon/book.png' : item.cover ? item.cover : '/media/icon/book.png'}
                                        alt=""/>
                                </div>
                                <div className="card-footer">
                                    <div className="book-name">
                                        {item.book ? item.book.title : item.title}
                                    </div>
                                    <div className="book-author">
                                        <span>Author:</span> {item.book ? item.book.author : item.author}
                                    </div>
                                    <div className="book-published">
                                        <span>Published:</span> {item.book ? item.book.published : item.published}
                                    </div>
                                </div>
                                {
                                    item?.book?.id ?
                                        <div className="card-action">
                                            <div onClick={() => {
                                                setDeleteId(item.book.id)
                                                showModalDelete()
                                            }} className="icon-circle">
                                                <img src="/media/icon/icons8-delete-100.png" alt=""/>
                                            </div>
                                            <div onClick={() => {
                                                setDeleteId(item.book.id)
                                                showModalEdit()
                                            }} className="icon-circle">
                                                <img src="/media/icon/edit.png" alt=""/>
                                            </div>
                                        </div> : ''
                                }
                                {
                                    item.book ?
                                        <div className="status">
                                            {generateStatus(item.status)}
                                        </div>
                                        : ''
                                }
                            </div>
                        ))
                    }


                </div>
                <div onClick={showModal} className="add-books">
                    <div className="add-text">
                        Add book
                    </div>
                </div>
                {
                    loading ?
                        <div className="spin">
                            <Spin size="large"/>
                        </div> : ''
                }

            </div>
            <Modal width={400} footer={null} title="ADD NEW BOOK" open={isModalOpen} onCancel={handleCancel}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 24,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="ISBN"
                        name="isbn"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your ISBN!',
                            },
                        ]}

                    >
                        <InputNumber width={'100'} size='large' min={0}  style={{
                            width: '100%',
                        }} />
                    </Form.Item>
                    <Form.Item

                    >
                        <Button style={{
                            borderRadius: '12px',
                            background: 'green',
                            justifyContent: 'center',
                            height: '44px',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center'
                        }} type="primary" htmlType="submit">
                            <div style={{fontWeight: '400', color: 'white', fontSize: '16px', marginLeft: '12px'}}
                                 className="key">
                                Save
                            </div>
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal width={400} footer={null} title="EDIT BOOK" open={isModalOpenEdit} onCancel={handleEdit}>
                <Form
                    name="basic"
                    labelCol={{
                        span: 24,
                    }}
                    wrapperCol={{
                        span: 24,
                    }}
                    style={{
                        maxWidth: 600,
                    }}
                    initialValues={{
                        remember: true,
                    }}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Status"
                        name="status"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your status!',
                            },
                        ]}
                    >
                        <Select
                            defaultValue={'choose'}
                            size={"large"}
                            onChange={handleChange}
                            options={[
                                {value: '0', label: 'new'},
                                {value: '1', label: 'reading'},
                                {value: '2', label: 'finished'},
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal width={400} footer={null} open={isModalOpenDelete} onCancel={handleDelete}>
                <div className="circle">
                    <img src="/media/icon/icons8-delete-100.png" alt=""/>
                </div>
                <div className="description">
                    Are you sure you want to delete the book?
                </div>
                <div className="footer-button">
                    <div onClick={handleDelete} className="cancel">Cancel</div>
                    <div onClick={() => deletedBook()} className="success">Delete book</div>
                </div>
            </Modal>
        </div>
    );
}

export default Books;