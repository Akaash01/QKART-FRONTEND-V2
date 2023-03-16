import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { SnackbarProvider, useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./../components/ProductCard";
import Cart,{generateCartItemsFrom} from "./Cart"

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimer, setDebounce] = useState(0);
  const [userData,setUserData] = useState();
  const [cartData,setCartData] = useState();

  useEffect(()=>{
   const username = localStorage.getItem('username');
   const token = localStorage.getItem('token');
   const balance = localStorage.getItem('balance');
   setUserData({username,token,balance})
  },[])
  useEffect(()=>{
    let task = async() =>{
    if(userData && userData?.token){
   let cartItems = await fetchCart(userData.token);
    let cartModData = generateCartItemsFrom(cartItems,products);
    setCartData(cartModData);
    }
  }
  task();
  },[userData,products])
  useEffect(() => {
    performAPICall();
  }, []);
  const performAPICall = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.endpoint}/products`);
      setProducts(res.data);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      enqueueSnackbar("something went wrong", {
        variant: "error",
      });
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      console.log(res);
      setProducts(res.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      setProducts([]);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout !== 0) {
      clearTimeout(debounceTimeout);
    }
    const newTimeOut = setTimeout(() => {
      performSearch(event.target.value);
    }, 1000);
    setDebounce(newTimeOut);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
       const res = await axios.get(`${config.endpoint}/cart`,{
        headers:{
          Authorization: "Bearer " + token
        }
       });
       return res.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
   let arr= items.filter((item)=> item._id === productId)
   if(arr.length==1) return true;
   return false;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    // token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
      console.log({productId,items});
      if(!userData || !userData?.token ){
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
        return;
      }
      let payload = {
        productId:productId,
      }
      if(isItemInCart(items,productId)){
        if(options.preventDuplicate){
          enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", {
            variant: "warning",
          });
        }
       let curItem = items.find((item)=> item._id == productId);
       console.log(curItem);
       let newQty = curItem.qty + qty;
       payload = {...payload,["qty"]:newQty}
      }
      else{
        payload = {...payload,["qty"]:1}
      }
      try{
        const res = await axios.post(`${config.endpoint}/cart`,payload,{
          headers:{
            Authorization:'Bearer '+userData.token
          }
        })
        console.log(res.data);

        let cartItems = generateCartItemsFrom(res.data,products);
        console.log(cartItems);
        setCartData(cartItems);
      }
      catch(err){
        console.log(err);
      }
  };

  return (
    <div>
      <Header hasHiddenAuthButtons={true}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, debounceTimer)}
        />
      </Header>
      <SnackbarProvider />
      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        onChange={(e) => debounceSearch(e, debounceTimer)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid item className="product-grid"  md={userData&& userData.token ? 9:12} xs={12}>
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
        
     
      {isLoading ? (
        <div className="loading">
          <CircularProgress />
          <p>Loading Products</p>
        </div>
      ) : (
        <Box m={2}>
          <Grid container spacing={2}>
            {products.length == 0 && (
              <Grid item xs={12}>
                <div className="placeholder-noproducts">
                  <SentimentDissatisfied />
                  <h6>No Products Found</h6>
                </div>
              </Grid>
            )}
            {products.map((item) => (
              <Grid item xs={6} md={3} key={item.name}>
                <ProductCard product={item} key={item.name} handleAddToCart={()=>addToCart(cartData,products,item._id,1,{ preventDuplicate: true })}/>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      </Grid>
      <Grid item md={3} xs={12}>
       {userData&& userData.token && <Cart products={products} items={cartData} handleQuantity={addToCart}/>}
        </Grid>
       </Grid>
      {/* TODO: CRIO_TASK_MODULE_CART - Display the Cart component */}
      <Footer />
    </div>
  );
};

export default Products;
