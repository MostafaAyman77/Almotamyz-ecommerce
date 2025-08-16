import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import OffCanvas from "../OffCanvas/OffCanvas";

const Header = () => {
  return (
    <div>
      <Navbar
        expand="lg"
        style={{ backgroundColor: "var(--color-background-dark)" }}
        variant="dark"
      >
        <Container>
          {/* Brand */}
          <Navbar.Brand
            as={Link}
            to="/"
            style={{ color: "var(--color-brand-primary)", fontWeight: "bold" }}
          >
            المتميز للمعدات
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto w-100 d-flex align-items-center">
              {/* Search Bar */}
              <Form className="d-flex align-items-center justify-content-center w-100">
                <Row className="w-100 text-center">
                  <Col
                    xs="auto"
                    className="d-flex align-items-center w-75 mx-auto"
                  >
                    <Form.Control
                      type="text"
                      placeholder="ابحث هنا..."
                      className="me-2"
                      style={{
                        backgroundColor: "var(--color-background-light)",
                        color: "var(--color-text-dark)",
                        border: "1px solid var(--color-brand-secondary)",
                        borderRadius: "8px",
                      }}
                    />
                    <Button
                      type="submit"
                      style={{
                        backgroundColor: "var(--color-brand-primary)",
                        border: "none",
                      }}
                    >
                      <FaSearch color="var(--color-text-light)" />
                    </Button>
                  </Col>
                </Row>
              </Form>

              {/* Links */}
              {/* <Nav.Link
                as={Link}
                to="/"
                style={{ color: "var(--color-text-light)", fontWeight: "500" }}
              >
                الرئيسية
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/store"
                style={{ color: "var(--color-text-light)", fontWeight: "500" }}
              >
                المتجر
              </Nav.Link> */}

              <OffCanvas />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default Header;
