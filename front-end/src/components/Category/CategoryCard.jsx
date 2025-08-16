import * as React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ImageLogo from "../../assets/Images/brand1.png";
const CategoryCard = () => {
  return (
    <>
      <Card sx={{ maxWidth: 345, marginTop: "20px" }}>
        <CardMedia
          component="img"
          alt="green iguana"
          height="140"
          image={ImageLogo}
        />
        <CardActions>
          <Button size="small">عرض المنتجات</Button>
        </CardActions>
      </Card>
    </>
  );
};

export default CategoryCard;
