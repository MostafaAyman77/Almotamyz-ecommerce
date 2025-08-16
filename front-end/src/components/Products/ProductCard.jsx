import * as React from "react";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FaCartPlus, FaHeart } from "react-icons/fa";

const ProductCard = ({
  id,
  imageCover,
  title,
  price,
  priceAfterDiscount,
  quantity,
}) => {
  return (
    <Card
      sx={{
        maxWidth: 300,
        height: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        transition: "0.3s",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        },
      }}
    >
      <Link
        to={`product/${id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardMedia
          component="img"
          alt={title}
          height="180"
          image={imageCover}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              fontWeight: "bold",
              color: "var(--color-text-dark)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "3.2em",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "var(--color-brand-primary)", fontWeight: "bold" }}
          >
            {priceAfterDiscount ? (
              <>
                {priceAfterDiscount} ج.م
                <span
                  style={{
                    textDecoration: "line-through",
                    marginLeft: 8,
                    marginRight: 8,
                    color: "gray",
                  }}
                >
                  {price} ج.م
                </span>
              </>
            ) : (
              `${price} ج.م`
            )}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "var(--color-text-dark)", mt: 1 }}
          >
            الكمية المتاحة:{" "}
            <span
              style={{
                fontWeight: "bolder",
                color: "var(--color-status-success)",
              }}
            >
              {quantity}
            </span>
          </Typography>
        </CardContent>
      </Link>

      {/* Actions */}
      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "var(--color-brand-primary)",
            color: "var(--color-text-light)",
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": { backgroundColor: "var(--color-brand-secondary)" },
            fontSize: "18px",
          }}
        >
          <FaCartPlus />
        </Button>

        <Button
          variant="outlined"
          sx={{
            borderColor: "var(--color-brand-primary)",
            color: "var(--color-brand-primary)",
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": {
              borderColor: "var(--color-brand-secondary)",
              color: "var(--color-brand-secondary)",
            },
            fontSize: "18px",
          }}
        >
          <FaHeart />
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
