import React from "react";
import useType from "@microstates/react";
import { map, reduce } from "microstates";

let products = [
  { id: 1, title: "iPad 4 Mini", price: 500.01, inventory: 2 },
  { id: 2, title: "H&M T-Shirt White", price: 10.99, inventory: 10 },
  { id: 3, title: "Charli XCX - Sucker CD", price: 19.99, inventory: 5 }
];

function InventoriedProduct(Type) {
  return class extends Type {
    inventory = Number;

    get isAvailable() {
      return this.inventory.state > 0;
    }
  };
}

class Product {
  id = Number;
  title = String;
  price = Number;
}

class Shop {
  products = [InventoriedProduct(Product)];
  cart = { Number };

  addToCart(id) {
    let current = this.cart[id];

    if (this.productsById[id].inventory.state > 0) {
      let cart = current ? current.increment() : this.cart.put(id, 1);

      return cart.productsById[id].inventory.decrement();
    } else {
      return this;
    }
  }

  get productsById() {
    return reduce(
      this.products,
      (acc, product) => {
        return {
          ...acc,
          [product.id.state]: product
        };
      },
      {}
    );
  }

  get cartTotal() {
    return Object.entries(this.cart).reduce(
      (acc, [id, inventory]) =>
        acc + this.productsById[id].price.state * inventory.state,
      0
    );
  }
}

export default function App() {
  let shop = useType(Shop, { products });

  console.log(shop);

  return (
    <div>
      <h4>Products</h4>
      <ul>
        {map(shop.products, product => (
          <li key={product.id.state}>
            {`${product.title.state} - $${product.price.state} x ${
              product.inventory.state
            }`}
            <button
              onClick={() => shop.addToCart(product.id.state)}
              disabled={!product.isAvailable}
            >
              Add to cart
            </button>
          </li>
        ))}
      </ul>
      <h4>Cart</h4>
      <ul>
        {Object.entries(shop.cart).map(([id, quantity]) => {
          let product = shop.productsById[id];
          return (
            <li key={id}>
              {`${product.title.state} - $${product.price.state} x ${
                quantity.state
              }`}
            </li>
          );
        })}
      </ul>
      <p>Total: ${shop.cartTotal}</p>
    </div>
  );
}
