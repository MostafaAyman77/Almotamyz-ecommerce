import { useState } from "react";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { TfiAlignJustify } from "react-icons/tfi";
import OffCanvasBody from "./OffCanvasBody";

function OffCanvas() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* زرار القائمة */}
      <Button
        onClick={handleShow}
        style={{
          backgroundColor: "var(--color-brand-primary)",
          border: "none",
          borderRadius: "8px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TfiAlignJustify size={22} color="var(--color-text-light)" />
      </Button>

      {/* القائمة الجانبية من اليمين */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        placement="end" // ✅ يفتح من اليمين
        style={{
          backgroundColor: "var(--color-background-dark)",
          color: "var(--color-text-light)",
        }}
      >
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title
            className="w-100 d-flex justify-content-between align-items-center p-2"
            style={{ color: "var(--color-brand-primary)", fontWeight: "bold" }}
          >
            المتميز للمعدات
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <OffCanvasBody />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default OffCanvas;
