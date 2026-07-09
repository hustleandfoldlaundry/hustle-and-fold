import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "@firebase/firestore/lite";
import AdminNav from "../components/AdminNav";

export default function AdminServices() {
  const [services, setServices] = useState({});
  const [activeTab, setActiveTab] = useState("Services");

  useEffect(() => {
    async function load() {
      const snap = await getDoc(
        doc(db, "admin", "services")
      );

      if (snap.exists()) {
  console.log(
    "ADDONS PAGE SERVICES:",
    JSON.stringify(snap.data(), null, 2)
  );
  setServices(snap.data());
}
    }

    load();
  }, []);

  function update(path, field, value) {
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        [path]: {
          ...prev.step1?.[path],
          [field]: value
        }
      }
    }));
  }

  function updateOversized(
    item,
    field,
    value
  ) {
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        oversized: {
          ...prev.step1?.oversized,
          [item]: {
            ...prev.step1?.oversized?.[item],
            [field]: value
          }
        }
      }
    }));
  }

  function toggle(section) {
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        [section]: {
          ...prev.step1?.[section],
          active:
            !prev.step1?.[section]?.active
        }
      }
    }));
  }

  function toggleOversized(item) {
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        oversized: {
          ...prev.step1?.oversized,
          [item]: {
            ...prev.step1?.oversized?.[item],
            active:
              !prev.step1?.oversized?.[item]
                ?.active
          }
        }
      }
    }));
  }

  async function save() {
    console.log("SAVING:", services);

await setDoc(
  doc(db, "admin", "services"),
  services
);

    alert("Saved ✅");
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "30px"
  };

  const containerStyle = {
    maxWidth: "900px",
    margin: "0 auto"
  };

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.08)"
  };

  const input = {
    padding: "10px",
    marginTop: "8px",
    width: "150px"
  };

  const textarea = {
    width: "100%",
    marginTop: "10px",
    padding: "10px"
  };

  const toggleBtn = (active) => ({
    marginTop: "10px",
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: active
      ? "#16a34a"
      : "#dc2626",
    color: "white",
    cursor: "pointer"
  });

  const preview = {
    marginTop: "15px",
    background: "#eff6ff",
    padding: "12px",
    borderRadius: "8px",
    color: "#1e3a8a"
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        <AdminNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <h2>
          Step 1 Services Configuration
        </h2>

        {/* WASH & FOLD */}

        <div style={card}>
          <h3>Wash & Fold</h3>

          <p>Price Per Pound</p>

        <button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          perPoundActive:
            !prev.step1?.washFold?.perPoundActive
        }
      }
    }))
  }
  style={toggleBtn(
    services?.step1?.washFold?.perPoundActive
  )}
>
  {services?.step1?.washFold?.perPoundActive
    ? "Per Pound Enabled"
    : "Per Pound Disabled"}
</button>

          <input
            type="number"
            step="0.01"
            value={
              services?.step1?.washFold
                ?.pricePerLb || ""
            }
            onChange={(e) =>
              update(
                "washFold",
                "pricePerLb",
                Number(e.target.value)
              )
            }
            style={input}
          />

          <p>Price Per Bag</p>

<p>Wash & Fold Bedding Price</p>

<input
  type="number"
  value={
    services?.step1?.washFold?.["Bedding Price"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          ["Bedding Price"]: Number(
            e.target.value
          )
        }
      }
    }))
  }
  style={input}
/>

<p>Wash & Fold Comforter Price</p>

<input
  type="number"
  value={
    services?.step1?.washFold?.["Comforter Price"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          ["Comforter Price"]: Number(
            e.target.value
          )
        }
      }
    }))
  }
  style={input}
/>

<p>Wash & Fold Sleeping Bag Price</p>

<input
  type="number"
  value={
    services?.step1?.washFold?.["Sleeping Bag Price"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          ["Sleeping Bag Price"]: Number(
            e.target.value
          )
        }
      }
    }))
  }
  style={input}
/>

<p>Wash & Fold Area Rug Price</p>

<input
  type="number"
  value={
    services?.step1?.washFold?.["Area Rug Price"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          ["Area Rug Price"]: Number(
            e.target.value
          )
        }
      }
    }))
  }
  style={input}
/>

        <button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        washFold: {
          ...prev.step1?.washFold,
          perBagActive:
            !prev.step1?.washFold?.perBagActive
        }
      }
    }))
  }
  style={toggleBtn(
    services?.step1?.washFold?.perBagActive
  )}
>
  {services?.step1?.washFold?.perBagActive
    ? "Per Bag Enabled"
    : "Per Bag Disabled"}
</button>

          <input
            type="number"
            step="0.01"
            value={
              services?.step1?.washFold
                ?.pricePerBag || ""
            }
            onChange={(e) =>
              update(
                "washFold",
                "pricePerBag",
                Number(e.target.value)
              )
            }
            style={input}
          />

          <textarea
            value={
              services?.step1?.washFold
                ?.notes || ""
            }
            onChange={(e) =>
              update(
                "washFold",
                "notes",
                e.target.value
              )
            }
            placeholder="Notes"
            style={textarea}
          />
          <div style={preview}>
            Customer Sees:
            <br />
            $
            {Number(
              services?.step1?.washFold
                ?.pricePerLb || 0
            ).toFixed(2)}
            {" "}per lb
          </div>
          <button
            onClick={() =>
              toggle("washFold")
            }
            style={toggleBtn(
              services?.step1?.washFold
                ?.active
            )}
          >
            {services?.step1?.washFold
              ?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>

        {/* FOLD ONLY */}

        <div style={card}>
          <h3>Fold Only</h3>

          <p>Price Per Pound</p>

          <input
            type="number"
            step="0.01"
            value={
              services?.step1?.foldOnly
                ?.pricePerLb || ""
            }
            onChange={(e) =>
              update(
                "foldOnly",
                "pricePerLb",
                Number(e.target.value)
              )
            }
            style={input}
          />
<p>Price Per Bag</p>

<input
  type="number"
  step="0.01"
  value={
    services?.step1?.foldOnly
      ?.["Price Per Bag"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          ["Price Per Bag"]: Number(
            e.target.value
          )
        }
      }
    }))
  }
  style={input}
/>

<p>Fold Only Bedding Price</p>

<input
  type="number"
  value={
    services?.step1?.foldOnly?.Bedding || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          Bedding: Number(e.target.value)
        }
      }
    }))
  }
  style={input}
/>

<p>Fold Only Comforter Price</p>

<input
  type="number"
  value={
    services?.step1?.foldOnly?.Comforter || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          Comforter: Number(e.target.value)
        }
      }
    }))
  }
  style={input}
/>

<p>Fold Only Sleeping Bag Price</p>

<input
  type="number"
  value={
    services?.step1?.foldOnly?.["Sleeping Bag"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          ["Sleeping Bag"]: Number(e.target.value)
        }
      }
    }))
  }
  style={input}
/>

<p>Fold Only Area Rug Price</p>

<input
  type="number"
  value={
    services?.step1?.foldOnly?.["Area Rug"] || ""
  }
  onChange={(e) =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          ["Area Rug"]: Number(e.target.value)
        }
      }
    }))
  }
  style={input}
/>

<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          perBagActive:
            !prev.step1?.foldOnly?.perBagActive
        }
      }
    }))
  }
  style={toggleBtn(
    services?.step1?.foldOnly?.perBagActive
  )}
>
  {services?.step1?.foldOnly?.perBagActive
    ? "Per Bag Enabled"
    : "Per Bag Disabled"}
</button>

<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      step1: {
        ...prev.step1,
        foldOnly: {
          ...prev.step1?.foldOnly,
          perPoundActive:
            !prev.step1?.foldOnly?.perPoundActive
        }
      }
    }))
  }
  style={toggleBtn(
    services?.step1?.foldOnly?.perPoundActive
  )}
>
  {services?.step1?.foldOnly?.perPoundActive
    ? "Per Pound Enabled"
    : "Per Pound Disabled"}
</button>

          <textarea
            value={
              services?.step1?.foldOnly
                ?.notes || ""
            }
            onChange={(e) =>
              update(
                "foldOnly",
                "notes",
                e.target.value
              )
            }
            placeholder="Notes"
            style={textarea}
          />
          <div style={preview}>
            Customer Sees:
            <br />
            $
            {Number(
              services?.step1?.foldOnly
                ?.pricePerLb || 0
            ).toFixed(2)}
            {" "}per lb
          </div>
          <button
            onClick={() =>
              toggle("foldOnly")
            }
            style={toggleBtn(
              services?.step1?.foldOnly
                ?.active
            )}
          >
            {services?.step1?.foldOnly
              ?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>

        {/* BEDDING */}

        <div style={card}>
          <h3>Bedding Sets</h3>

          <p>Price Per Set</p>

          <input
            type="number"
            step="0.01"
            value={
              services?.step1?.bedding
                ?.price || ""
            }
            onChange={(e) =>
              update(
                "bedding",
                "price",
                Number(e.target.value)
              )
            }
            style={input}
          />

          <textarea
            value={
              services?.step1?.bedding
                ?.notes || ""
            }
            onChange={(e) =>
              update(
                "bedding",
                "notes",
                e.target.value
              )
            }
            placeholder="Notes"
            style={textarea}
          />
          <div style={preview}>
            Customer Sees:
            <br />
            $
            {Number(
              services?.step1?.bedding
                ?.price || 0
            ).toFixed(2)}
            {" "}each
          </div>
          <button
            onClick={() =>
              toggle("bedding")
            }
            style={toggleBtn(
              services?.step1?.bedding
                ?.active
            )}
          >
            {services?.step1?.bedding
              ?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>

        {/* COMFORTER */}

        <div style={card}>
          <h3>Down Comforter</h3>

          <input
            type="number"
            value={
              services?.step1?.oversized
                ?.comforter?.price || ""
            }
            onChange={(e) =>
              updateOversized(
                "comforter",
                "price",
                Number(e.target.value)
              )
            }
            style={input}
          />
          <div style={preview}>
            Customer Sees: $
            {Number(
              services?.step1?.oversized
                ?.comforter?.price || 0
            ).toFixed(2)}
          </div>
          <button
            onClick={() =>
              toggleOversized(
                "comforter"
              )
            }
            style={toggleBtn(
              services?.step1?.oversized
                ?.comforter?.active
            )}
          >
            {services?.step1?.oversized
              ?.comforter?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>

        {/* SLEEPING BAG */}

        <div style={card}>
          <h3>Sleeping Bag</h3>

          <input
            type="number"
            value={
              services?.step1?.oversized
                ?.sleepingBag?.price || ""
            }
            onChange={(e) =>
              updateOversized(
                "sleepingBag",
                "price",
                Number(e.target.value)
              )
            }
            style={input}
          />
          <div style={preview}>
            Customer Sees: $
            {Number(
              services?.step1?.oversized
                ?.sleepingBag?.price || 0
            ).toFixed(2)}
          </div>
          <button
            onClick={() =>
              toggleOversized(
                "sleepingBag"
              )
            }
            style={toggleBtn(
              services?.step1?.oversized
                ?.sleepingBag?.active
            )}
          >
            {services?.step1?.oversized
              ?.sleepingBag?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>

        {/* RUG */}

        <div style={card}>
          <h3>Area Rug</h3>

          <input
            type="number"
            value={
              services?.step1?.oversized
                ?.rug?.price || ""
            }
            onChange={(e) =>
              updateOversized(
                "rug",
                "price",
                Number(e.target.value)
              )
            }
            style={input}
          />
          <div style={preview}>
            Customer Sees: $
            {Number(
              services?.step1?.oversized
                ?.rug?.price || 0
            ).toFixed(2)}
          </div>
          <button
            onClick={() =>
              toggleOversized("rug")
            }
            style={toggleBtn(
              services?.step1?.oversized
                ?.rug?.active
            )}
          >
            {services?.step1?.oversized
              ?.rug?.active
              ? "Enabled"
              : "Disabled"}
          </button>
        </div>
{/* DETERGENTS */}

<div style={card}>
  <h3>Detergents</h3>

  <h4>All Sensitive Fresh</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.detergent?.hypoallergenicSensitive
        ?.allSensitiveFresh?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        detergent: {
          ...prev.detergent,
          hypoallergenicSensitive: {
            ...prev.detergent?.hypoallergenicSensitive,
            allSensitiveFresh: {
              ...prev.detergent?.hypoallergenicSensitive?.allSensitiveFresh,
              price: Number(e.target.value)
            }
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.detergent?.hypoallergenicSensitive
        ?.allSensitiveFresh?.price || 0
    ).toFixed(2)}
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      detergent: {
        ...prev.detergent,
        hypoallergenicSensitive: {
          ...prev.detergent?.hypoallergenicSensitive,
          allSensitiveFresh: {
            ...prev.detergent?.hypoallergenicSensitive?.allSensitiveFresh,
            active:
              !prev.detergent?.hypoallergenicSensitive
                ?.allSensitiveFresh?.active
          }
        }
      }
    }))
  }
  style={toggleBtn(
    services?.detergent?.hypoallergenicSensitive
      ?.allSensitiveFresh?.active
  )}
>
  {services?.detergent?.hypoallergenicSensitive
    ?.allSensitiveFresh?.active
    ? "Enabled"
    : "Disabled"}
</button>
  <hr style={{ margin: "20px 0" }} />

  <h4>Tide Free & Gentle</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.detergent?.hypoallergenicSensitive
        ?.tideFreeAndGental?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        detergent: {
          ...prev.detergent,
          hypoallergenicSensitive: {
            ...prev.detergent?.hypoallergenicSensitive,
            tideFreeAndGental: {
              ...prev.detergent?.hypoallergenicSensitive?.tideFreeAndGental,
              price: Number(e.target.value)
            }
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.detergent?.hypoallergenicSensitive
        ?.tideFreeAndGental?.price || 0
    ).toFixed(2)}
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      detergent: {
        ...prev.detergent,
        hypoallergenicSensitive: {
          ...prev.detergent?.hypoallergenicSensitive,
          tideFreeAndGental: {
            ...prev.detergent?.hypoallergenicSensitive?.tideFreeAndGental,
            active:
              !prev.detergent?.hypoallergenicSensitive
                ?.tideFreeAndGental?.active
          }
        }
      }
    }))
  }
  style={toggleBtn(
    services?.detergent?.hypoallergenicSensitive
      ?.tideFreeAndGental?.active
  )}
>
  {services?.detergent?.hypoallergenicSensitive
    ?.tideFreeAndGental?.active
    ? "Enabled"
    : "Disabled"}
</button>
  <hr style={{ margin: "20px 0" }} />

  <h4>Customer Provided Discount</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.detergent?.customerProvided?.discount || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        detergent: {
          ...prev.detergent,
          customerProvided: {
            ...prev.detergent?.customerProvided,
            discount: Number(e.target.value)
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    $
    {Number(
      services?.detergent?.customerProvided?.discount || 0
    ).toFixed(2)}
  </div>
  <button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      detergent: {
        ...prev.detergent,
        customerProvided: {
          ...prev.detergent?.customerProvided,
          active:
            !prev.detergent?.customerProvided?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.detergent?.customerProvided?.active
  )}
>
  {services?.detergent?.customerProvided?.active
    ? "Enabled"
    : "Disabled"}
</button>

  {/* ADD-ONS */}

<div style={card}>
  <h3>Add-Ons</h3>

  <h4>OxiClean</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.addons?.oxi?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        addons: {
          ...prev.addons,
          oxi: {
            ...prev.addons?.oxi,
            price: Number(e.target.value)
          }
        }
      }))
    }
    style={input}
  />
  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.addons?.oxi?.price || 0
    ).toFixed(2)}
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        oxi: {
          ...prev.addons?.oxi,
          active:
            !prev.addons?.oxi?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.addons?.oxi?.active
  )}
>
  {services?.addons?.oxi?.active
    ? "Enabled"
    : "Disabled"}
</button>
  <hr style={{ margin: "20px 0" }} />

  <h4>Color Saver</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.addons?.color?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        addons: {
          ...prev.addons,
          color: {
            ...prev.addons?.color,
            price: Number(e.target.value)
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.addons?.color?.price || 0
    ).toFixed(2)}
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        color: {
          ...prev.addons?.color,
          active:
            !prev.addons?.color?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.addons?.color?.active
  )}
>
  {services?.addons?.color?.active
    ? "Enabled"
    : "Disabled"}
</button>

  <hr style={{ margin: "20px 0" }} />

  <h4>Vinegar Rinse</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.addons?.vinegar?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        addons: {
          ...prev.addons,
          vinegar: {
            ...prev.addons?.vinegar,
            price: Number(e.target.value)
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.addons?.vinegar?.price || 0
    ).toFixed(2)}
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        vinegar: {
          ...prev.addons?.vinegar,
          active:
            !prev.addons?.vinegar?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.addons?.vinegar?.active
  )}
>
  {services?.addons?.vinegar?.active
    ? "Enabled"
    : "Disabled"}
</button>

  <hr style={{ margin: "20px 0" }} />

  <h4>Delicates Care</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.addons?.delicates?.price || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        addons: {
          ...prev.addons,
          delicates: {
            ...prev.addons?.delicates,
            price: Number(e.target.value)
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    +$
    {Number(
      services?.addons?.delicates?.price || 0
    ).toFixed(2)}
  </div>
  <button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      addons: {
        ...prev.addons,
        delicates: {
          ...prev.addons?.delicates,
          active:
            !prev.addons?.delicates?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.addons?.delicates?.active
  )}
>
  {services?.addons?.delicates?.active
    ? "Enabled"
    : "Disabled"}
</button>
</div>

{/* HANGING CARE */}

<div style={card}>
  <h3>Hanging Care</h3>

  <h4>Price Per Item</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.hangingCare?.hanging
        ?.pricePerItem || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        hangingCare: {
          ...prev.hangingCare,
          hanging: {
            ...prev.hangingCare?.hanging,
            pricePerItem: Number(
              e.target.value
            )
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    $
    {Number(
      services?.hangingCare?.hanging
        ?.pricePerItem || 0
    ).toFixed(2)}
    {" "}per item
  </div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      hangingCare: {
        ...prev.hangingCare,
        hanging: {
          ...prev.hangingCare?.hanging,
          active:
            !prev.hangingCare?.hanging?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.hangingCare?.hanging?.active
  )}
>
  {services?.hangingCare?.hanging?.active
    ? "Enabled"
    : "Disabled"}
</button>

  <hr style={{ margin: "20px 0" }} />

  <h4>Price Per Hanger</h4>

  <input
    type="number"
    step="0.01"
    value={
      services?.hangingCare?.hangers
        ?.pricePerHanger || ""
    }
    onChange={(e) =>
      setServices((prev) => ({
        ...prev,
        hangingCare: {
          ...prev.hangingCare,
          hangers: {
            ...prev.hangingCare?.hangers,
            pricePerHanger: Number(
              e.target.value
            )
          }
        }
      }))
    }
    style={input}
  />

  <div style={preview}>
    Customer Sees:
    <br />
    $
    {Number(
      services?.hangingCare?.hangers
        ?.pricePerHanger || 0
    ).toFixed(2)}
    {" "}per hanger
  </div>
</div>
<button
  onClick={() =>
    setServices((prev) => ({
      ...prev,
      hangingCare: {
        ...prev.hangingCare,
        hangers: {
          ...prev.hangingCare?.hangers,
          active:
            !prev.hangingCare?.hangers?.active
        }
      }
    }))
  }
  style={toggleBtn(
    services?.hangingCare?.hangers?.active
  )}
>
  {services?.hangingCare?.hangers?.active
    ? "Enabled"
    : "Disabled"}
</button>

</div>
        <button
          onClick={save}
          style={{
            marginTop: "30px",
            padding: "14px 24px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Save All Changes
        </button>

      </div>
    </div>
  );
}
``