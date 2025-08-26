import React, { useState } from "react";
import Container from "react-bootstrap/esm/Container";
import Form from "react-bootstrap/esm/Form";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import { REGISTER } from "../../../Api/Api";
import { Link } from "react-router-dom";
import Cookie from "cookie-universal";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    address: "",
  });

  // Cookie
  const cookie = Cookie();
  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  // console.log(form);

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await axios.post(`${REGISTER}`, {
        email: form.email,
        password: form.password,
      });
      const token = response.data.token;
      cookie.set("token", token);
      window.location.href = "/";
    } catch (error) {
      if (error.response.status === 422) {
        alert("Email is already been taken"); // will be changed when making css error design
      } else {
        console.error("There was an error!", error);
      }
    }
  }

  return (
    <>
      <div className="container">
        <Container className="mt-5" style={{ maxWidth: "600px" }}>
          <h2 className="mb-4 text-center">تسجيل حساب جديد</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>الاسم بالكامل</Form.Label>
              <Form.Control
                type="text"
                placeholder="ادخل اسمك"
                onChange={handleChange}
                name="name"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                onChange={handleChange}
                name="email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPhone">
              <Form.Label>رقم التليفون</Form.Label>
              <Form.Control
                type="number"
                placeholder="01012345678"
                onChange={handleChange}
                name="phone"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                onChange={handleChange}
                name="password"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>تأكيد كلمة المرور</Form.Label>
              <Form.Control
                type="password"
                placeholder="********"
                onChange={handleChange}
                name="passwordConfirm"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formAddress">
              <Form.Label>العنوان</Form.Label>
              <Form.Control
                type="text"
                placeholder="اكتب عنوانك"
                onChange={handleChange}
                name="address"
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                تسجيل
              </Button>
            </div>
            <Link to="/login" className="d-block text-center mt-3">
              لديك حساب؟ تسجيل الدخول
            </Link>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default Register;
