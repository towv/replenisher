import "./App.css";
import standardInput from "./util/input.json";
import React, { useEffect, useState } from 'react'


class BatchSize {
  code: string;
  size: number;

  constructor(code: string, size: number) {
    this.code = code;
    this.size = size;
  }
}

class Order {
  productCode: string;
  batchSizeCode: string;
  productName: string;
  batchSize: number;
  batchQuantity: number;
  pricePerUnit: number;

  constructor(
    productCode: string,
    batchSizeCode: string,
    productName: string,
    batchSize: number,
    batchQuantity: number,
    pricePerUnit: number
  ) {
    this.productCode = productCode;
    this.batchSizeCode = batchSizeCode;
    this.productName = productName;
    this.batchSize = batchSize;
    this.batchQuantity = batchQuantity;
    this.pricePerUnit = pricePerUnit;
  }
}

function App() {

  const [order, setOrder] = useState<Order[]>()

  const [input, setInput] = useState<string>(JSON.stringify(standardInput))
  
  type Product = {
    code: string;
    name: string;
    pricePerUnit: number;
  };

  type BatchSize = {
    code: string;
    size: number;
  };

  type ProductBatchSize = {
    productCode: string;
    batchSizeCode: string;
  };

  type BatchQuantity = {
    productCode: string;
    quantity: number;
  };

  function orderProducer(
    products: Product[],
    batchSizes: BatchSize[],
    productBatchSizes: ProductBatchSize[],
    batchQuantities: BatchQuantity[],
    useMaximumBatchSize: boolean
  ): Order[] {
    let orders: Order[] = [];

    products.forEach((p) => {
      const batchSizesForThisProduct: BatchSize[] = batchSizes
        .filter((b) => {
          return productBatchSizes
            .filter((pb) => pb.productCode === p.code)
            .find((f) => f.batchSizeCode === b.code);
        })
        .sort((a, b) => {
          return b.size - a.size;
        });

      const chosenBatch: BatchSize =
        batchSizesForThisProduct.length === 0
          ? new BatchSize("BS_GENERATED_" + p.code, 1)
          : useMaximumBatchSize
          ? batchSizesForThisProduct[0]
          : batchSizesForThisProduct[batchSizesForThisProduct.length - 1];

      let batchQuantity = batchQuantities.find((q) => q.productCode === p.code);

      orders.push(
        new Order(
          p.code,
          chosenBatch.code,
          p.name,
          chosenBatch.size,
          batchQuantity ? batchQuantity.quantity : 1,
          p.pricePerUnit
        )
      );
    });
    return orders;
  }
  const handleInputData = ( maxBatchSize: boolean | void ) => {
    if (!input) {
      return;
    }
    const parsedInputData = JSON.parse(input);

    const inputProducts = parsedInputData.product;
    const inputBatchSizes = parsedInputData.batchSize;
    const inputProductBatchSizes = parsedInputData.productBatchSize;
    const inputBatchQuantities = parsedInputData.numberOfBatches;
    let inputUseMaximumBatchSize = parsedInputData.useMaximumBatchSize;

    if (maxBatchSize !== undefined ) {
      inputUseMaximumBatchSize = maxBatchSize;
    };

    let order = orderProducer(
      inputProducts,
      inputBatchSizes,
      inputProductBatchSizes,
      inputBatchQuantities,
      inputUseMaximumBatchSize
    );

    setOrder(order);
  
    console.log(order);
  }

  const useMinBatchSize = () => {
    handleInputData(false);
  }

  const useMaxBatchSize = () => {
    handleInputData(true);
  }

  const usePredefinedBatchSize = () => {
    handleInputData();
  }

  const onChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
    e.preventDefault()

    setInput(e.currentTarget.value)
  }

  const onSubmit = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault()

    console.log(input);
    if (!input) {
      return;
    }
    
    handleInputData();
  }

  const renderTable = () => {

    if (!order) return <div/>

    return (
       <div>
      <br />
      <table>
        <thead>
          <tr>
            <th colSpan={6}>Orders</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Batch Size Code</th>
            <th>Batch Size</th>
            <th>Batch quantity</th>
            <th>Price per Unit</th>
          </tr>

          {order.map((row) => {
            return (
              <tr key={row.productCode}>
                <td>{row.productCode}</td>
                <td>{row.productName}</td>
                <td>{row.batchSizeCode}</td>
                <td>{row.batchSize}</td>
                <td>{row.batchQuantity}</td>
                <td>{row.pricePerUnit}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    );
  }


  return (
    <div>
      <br/>
      <button onClick={usePredefinedBatchSize}>Produce order from input</button>
      <button onClick={useMinBatchSize}>Produce order with minimum batch size</button>
      <button onClick={useMaxBatchSize}>Produce order with maximum batch size</button>

      <br/>
      {renderTable()}

      <br/>
      <div>
        <form>
          <label style={{ marginTop: 10, width: '50%', display: "flex", alignItems: 'center' }}>Input in JSON format</label>
          <textarea style={{ marginTop: 10 }} rows={20} cols={100} value={input} onChange={onChange} />
          <input type="submit" onClick={onSubmit} value="Calculate orders" style={{ marginTop: 10 }} />
        </form>
      </div>
    </div>
  );
}

export default App;
