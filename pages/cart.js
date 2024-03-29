import Button from "@/components/Button";
import { CartContext } from "@/components/CartContext";
import Center from "@/components/Center";
import Header from "@/components/Header";
import Input from "@/components/Input";
import Table from "@/components/Table";
import axios from "axios";
import { useSession } from "next-auth/react";
import { RevealWrapper } from "next-reveal";
import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
//stripe checkout
const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin: 40px 0;

  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
`;

const Box = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  height: fit-content;
`;

const ProductInfoCell = styled.td`
  padding: 10px 0;
`;

const ProductImageBox = styled.div`
  width: 100px;
  height: 100px;
  padding: 2px;
  border: 1px soldi rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;

  img {
    max-width: 80px;
    max-height: 80px;
  }
  @media screen and (min-width: 768px) {
    padding: 10px;
  }
`;

const QuantityLabel = styled.span`
  padding: 0 15px;
  display: block;
  margin: 5px 0;
  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 10px;
  }
`;

export const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;

export const TitleCart = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;

`;


export default function CartPage() {
  const { cartProducts, addProduct, removeProduct, clearCart } =
    useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (cartProducts.length > 0) {
      axios
        .post(`/api/cart`, {
          ids: cartProducts,
        })
        .then((response) => {
          setProducts(response.data);
        });
    } else {
      setProducts([]);
    }
  }, [cartProducts]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window.location.href.includes("success")) {
      setIsSuccess(true);
      clearCart();
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    axios.get("/api/address").then((res) => {
      const address = res.data;
      if (address) {
        setName(address.name);
        setEmail(address.email);
        setCity(address.city);
        setPostalCode(address.postalCode);
        setStreetAddress(address.streetAddress);
        setCountry(address.country);
      }
    });
  }, [session])

  function moreOfThisProduct(id) {
    addProduct(id);
  }

  function lessOfThisProduct(id) {
    removeProduct(id);
  }

  async function goToPayment() {
    const response = await axios.post(`/api/checkout`, {
      name,
      email,
      city,
      postalCode,
      streetAddress,
      country,
      cartProducts,
    });
    if (response.data.url) {
      window.location = response.data.url;
    }
  }

  let total = 0;

  for (const productId of cartProducts) {
    const price = products.find((p) => p._id === productId)?.price || 0;
    total += price;
  }

  function clearCartFunc() {
    clearCart()
  }

  if (isSuccess) {
    return (
      <>
        <Header />
        <Center>
          <ColumnsWrapper>
            <Box>
              <h1>Thanks for your order!</h1>
              <p>We will send you a email when your order will be sent.</p>
            </Box>
          </ColumnsWrapper>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header />
      <Center>
        <ColumnsWrapper>
          <RevealWrapper>
            <Box>
              <TitleCart>

              <h2>Cart</h2>
              <Button
              black
              onClick={clearCartFunc}
              >Clear</Button>
              </TitleCart>
              {!cartProducts?.length && <div>Your Cart is Empty</div>}

              {products?.length > 0 && (
                <Table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((product, _) => (
                      <tr key={_}>
                        <ProductInfoCell>
                          <ProductImageBox>
                            <img src={product?.images[0]} />
                          </ProductImageBox>
                          {product?.title}
                        </ProductInfoCell>

                        <td>
                          <Button
                            cartBtn
                            onClick={() => lessOfThisProduct(product._id)}
                          >
                            -
                          </Button>
                          <QuantityLabel>
                            {
                              cartProducts.filter((id) => id === product._id)
                                .length
                            }
                          </QuantityLabel>
                          <Button
                            cartBtn
                            onClick={() => moreOfThisProduct(product._id)}
                          >
                            +
                          </Button>
                        </td>
                        <td>
                          $
                          {cartProducts.filter((id) => id === product._id)
                            .length * product.price}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td>${total}</td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </Box>
          </RevealWrapper>

          {!!cartProducts?.length && (
            <Box>
              <h2>Order Information</h2>

              <Input
                type="text"
                placeholder="Name"
                value={name}
                name="name"
                onChange={(ev) => setName(ev.target.value)}
              />
              <Input
                type="text"
                placeholder="Email"
                value={email}
                name="email"
                onChange={(ev) => setEmail(ev.target.value)}
              />
              <CityHolder>
                <Input
                  type="text"
                  placeholder="City"
                  value={city}
                  name="city"
                  onChange={(ev) => setCity(ev.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  name="postalCode"
                  onChange={(ev) => setPostalCode(ev.target.value)}
                />
              </CityHolder>
              <Input
                type="text"
                placeholder="Street Address"
                value={streetAddress}
                name="streetAddress"
                onChange={(ev) => setStreetAddress(ev.target.value)}
              />
              <Input
                type="text"
                placeholder="Country"
                value={country}
                name="country"
                onChange={(ev) => setCountry(ev.target.value)}
              />
              <Button black block onClick={goToPayment}>
                Checkout
              </Button>
            </Box>
          )}
        </ColumnsWrapper>
      </Center>
    </>
  );
}
