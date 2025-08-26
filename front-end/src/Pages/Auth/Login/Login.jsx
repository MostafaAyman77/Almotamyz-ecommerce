import React, { useState } from "react";
import Container from "react-bootstrap/esm/Container";
import Form from "react-bootstrap/esm/Form";
import Button from "react-bootstrap/esm/Button";
import axios from "axios";
import { LOGIN } from "../../../Api/Api";
import { Link } from "react-router-dom";
import Cookie from "cookie-universal";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
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
      const response = await axios.post(`${LOGIN}`, {
        email: form.email,
        password: form.password,
      });
      const token = response.data.token;
      cookie.set("token", token);
      window.location.href = "/";
    } catch (error) {
      if (error.response.status === 401) {
        alert("invalid email or password"); // will be changed when making css error design
      } else {
        console.error("There was an error!", error);
      }
    }
  }

  return (
    <>
      <div className="container">
        <Container className="mt-5" style={{ maxWidth: "600px" }}>
          <h2 className="mb-4 text-center">تسجيل الدخول</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>البريد الإلكتروني</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@email.com"
                onChange={handleChange}
                name="email"
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

            <div className="d-grid">
              <Button variant="primary" type="submit">
                دخول
              </Button>
            </div>
            <Link to="/register" className="d-block text-center mt-3">
              ليس لديك حساب؟ تسجيل جديد
            </Link>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default Login;
