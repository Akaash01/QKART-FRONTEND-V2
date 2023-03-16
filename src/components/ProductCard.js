import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
  Box
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
     <CardMedia
          component="img"
          height="140"
          image={product.image}
          alt="green iguana"
        />
        <CardContent>
        <Typography gutterBottom variant="body1" component="div">
          {product.name}
          </Typography>
          <Typography gutterBottom variant="h5" component="div">
          <Box sx={{ fontWeight: 'bold' }}>
            ${product.cost}
          </Box>
          </Typography>
          <Rating
           name="simple-controlled"
           value={product.rating}
           readOnly
          />
        </CardContent>
        <CardActions className="card-actions">
        <Button  className="card-button" variant="contained" startIcon={<AddShoppingCartOutlined/>} fullWidth onClick={handleAddToCart}>
           Add to cart
          </Button>
        </CardActions>
    </Card>
  );
};

export default ProductCard;
