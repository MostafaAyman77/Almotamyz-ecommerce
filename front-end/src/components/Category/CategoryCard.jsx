import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import ImageLogo from "../../assets/Images/brand1.png";
const CategoryCard = ({ image }) => {
  return (
    <>
      <Card sx={{ maxWidth: 345, marginTop: "20px" }}>
        <CardMedia
          component="img"
          alt="green iguana"
          height="140"
          image={image}
        />
        <CardActions>
          <Button size="small">عرض المنتجات</Button>
        </CardActions>
      </Card>
    </>
  );
};

export default CategoryCard;
