import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import { db } from "../firebase";
import { doc, getDoc } from "@firebase/firestore/lite";

export default function BookingStep1() {
  const navigate = useNavigate();
  const { bookingData, setBookingData } = useBooking();

  const [services, setServices] = useState({});

  const [washFold, setWashFold] = useState(false);
  const [foldOnly, setFoldOnly] = useState(false);
  const [washFoldType, setWashFoldType] = useState("pound");

  useEffect(() => {
  if (
    services?.step1?.washFold?.perPoundActive === false &&
    services?.step1?.washFold?.perBagActive === true
  ) {
    setWashFoldType("bag");
  }
}, [services]);

  const [washFoldBags, setWashFoldBags] = useState(1);
  const [washFoldLbs, setWashFoldLbs] = useState(10);
  const [foldOnlyLbs, setFoldOnlyLbs] = useState(10);
  const [foldOnlyType, setFoldOnlyType] = useState("pound");
  const [foldOnlyBags, setFoldOnlyBags] = useState(1);
  const [washFoldBedding, setWashFoldBedding] = useState(0);
  const [foldOnlyBedding, setFoldOnlyBedding] = useState(0);

  const [washFoldComforter, setWashFoldComforter] = useState(0);
  const [foldOnlyComforter, setFoldOnlyComforter] = useState(0);

  const [washFoldSleepingBag, setWashFoldSleepingBag] = useState(0);
  const [foldOnlySleepingBag, setFoldOnlySleepingBag] = useState(0);

  const [washFoldRug, setWashFoldRug] = useState(0);
  const [foldOnlyRug, setFoldOnlyRug] = useState(0);

  const [otherCount, setOtherCount] = useState(0);
  const [otherText, setOtherText] = useState("");
  const [otherConfirmed, setOtherConfirmed] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const snap = await getDoc(
          doc(db, "admin", "services")
        );

        if (snap.exists()) {
  
  setServices(snap.data());
}
      } catch (error) {
        console.error("Service loading error:", error);
      }
    }

    loadServices();
  }, []);

  const washFoldPrice =
    Number(services?.step1?.washFold?.pricePerLb || 2.25);

  const washFoldBagPrice =
    Number(services?.step1?.washFold?.pricePerBag || 35);
  const foldOnlyPrice =
    Number(services?.step1?.foldOnly?.pricePerLb || 1);

    const foldOnlyBagPrice =
  Number(
    services?.step1?.foldOnly?.["Price Per Bag"] || 15
  );

const washFoldBeddingPrice =
  Number(
    services?.step1?.washFold?.["Bedding Price"] || 25
  );

const washFoldComforterPrice =
  Number(
    services?.step1?.washFold?.["Comforter Price"] || 18
  );

const washFoldSleepingBagPrice =
  Number(
    services?.step1?.washFold?.["Sleeping Bag Price"] || 15
  );

const washFoldRugPrice =
  Number(
    services?.step1?.washFold?.["Area Rug Price"] || 20
  );

const foldOnlyBeddingPrice =
  Number(
    services?.step1?.foldOnly?.Bedding || 12
  );

const foldOnlyComforterPrice =
  Number(
    services?.step1?.foldOnly?.Comforter || 9
  );

const foldOnlySleepingBagPrice =
  Number(
    services?.step1?.foldOnly?.["Sleeping Bag"] || 7
  );

const foldOnlyRugPrice =
  Number(
    services?.step1?.foldOnly?.["Area Rug"] || 10
  );

  const washFoldTotal =
  !washFold
    ? 0
    : washFoldType === "bag"
    ? washFoldBags * washFoldBagPrice
    : washFoldLbs * washFoldPrice;

  const foldOnlyTotal =
  !foldOnly
    ? 0
    : foldOnlyType === "bag"
    ? foldOnlyBags * foldOnlyBagPrice
    : foldOnlyLbs * foldOnlyPrice;

  const washFoldBeddingTotal =
  washFoldBedding * washFoldBeddingPrice;

const foldOnlyBeddingTotal =
  foldOnlyBedding * foldOnlyBeddingPrice;

const washFoldComforterTotal =
  washFoldComforter * washFoldComforterPrice;

const foldOnlyComforterTotal =
  foldOnlyComforter * foldOnlyComforterPrice;

const washFoldSleepingBagTotal =
  washFoldSleepingBag * washFoldSleepingBagPrice;

const foldOnlySleepingBagTotal =
  foldOnlySleepingBag * foldOnlySleepingBagPrice;

const washFoldRugTotal =
  washFoldRug * washFoldRugPrice;

const foldOnlyRugTotal =
  foldOnlyRug * foldOnlyRugPrice;

  const oversizedTotal =
  washFoldComforterTotal +
  foldOnlyComforterTotal +
  washFoldSleepingBagTotal +
  foldOnlySleepingBagTotal +
  washFoldRugTotal +
  foldOnlyRugTotal;

console.log({
  washFoldTotal,
  foldOnlyTotal,
  washFoldBeddingTotal,
  foldOnlyBeddingTotal,
  oversizedTotal
});

  const total =
  washFoldTotal +
  foldOnlyTotal +
  washFoldBeddingTotal +
  foldOnlyBeddingTotal +
  oversizedTotal;

  function handleNext() {
    if (
      washFoldBedding === 0 &&
      foldOnlyBedding === 0 &&
      washFoldComforter === 0 &&
      foldOnlyComforter === 0 &&
      washFoldSleepingBag === 0 &&
      foldOnlySleepingBag === 0 &&
      washFoldRug === 0 &&
      foldOnlyRug === 0 &&
      otherCount === 0
    ) {
      setError("Please select at least one service.");
      return;
    }

    if (otherCount > 0 && (!otherText || !otherConfirmed)) {
      setError(
        "Please describe the other item and confirm the checkbox."
      );
      return;
    }

    setError("");

    setBookingData({
      ...bookingData,
      step1Total: total,
      washFold,
      foldOnly,
      washFoldLbs,
      washFoldType,
      washFoldBags,
      foldOnlyLbs,
      washFoldBedding,
      foldOnlyBedding,
      washFoldComforter,
      foldOnlyComforter,
      washFoldSleepingBag,
      foldOnlySleepingBag,
      washFoldRug,
      foldOnlyRug,
      otherCount,
      otherText,
      otherConfirmed
    });

    navigate("/booking/step2");
  }

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const buttonBase = {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer"
  };

  const counterRow = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        display: "flex",
        justifyContent: "center",
        padding: "30px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <ProgressBar step={1} />

        <h2
          style={{
            textAlign: "center",
            color: "#1e3a8a"
          }}
        >
          Step 1: Laundry Services
        </h2>
      
      {services?.step1?.washFold?.active && (
        <div style={card}>
          <button
            onClick={() => setWashFold(!washFold)}
            style={{
              ...buttonBase,
              backgroundColor: washFold
                ? "#2563eb"
                : "#dbeafe",
              color: washFold
                ? "white"
                : "#1e3a8a"
            }}
          >
            Wash & Fold
          </button>

          {washFold && (
            <>
            <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px"
  }}
>
  
  {services?.step1?.washFold?.perPoundActive && (
  <button
    onClick={() => setWashFoldType("pound")}
    style={{
      ...buttonBase,
      backgroundColor:
        washFoldType === "pound"
          ? "#2563eb"
          : "#dbeafe",
      color:
        washFoldType === "pound"
          ? "white"
          : "#1e3a8a"
    }}
  >
    Per Pound
  </button>
)}

  {services?.step1?.washFold?.perBagActive && (
  <button
    onClick={() => setWashFoldType("bag")}
    style={{
      ...buttonBase,
      backgroundColor:
        washFoldType === "bag"
          ? "#2563eb"
          : "#dbeafe",
      color:
        washFoldType === "bag"
          ? "white"
          : "#1e3a8a"
    }}
  >
    Per Bag
  </button>
)}
</div>
              {washFoldType === "pound" ? (
  <>
    <p>${washFoldPrice.toFixed(2)} per lb</p>
<p
  style={{
    fontSize: "14px",
    color: "#666",
    marginTop: "5px"
  }}
>
  One bag holds approximately 15–20 lbs of laundry.
  A bag is a large kitchen bag. 

  ***The best way for you to weigh your clothes is to weigh yourself on a scale then weigh yourself with the the clothes. Subtract your weight from your wieght + your clothes. Do this for each bag and add them all together.***
</p>
    <input
      type="range"
      min="10"
      max="50"
      value={washFoldLbs}
      onChange={(e) =>
        setWashFoldLbs(
          Number(e.target.value)
        )
      }
    />

    <p>{washFoldLbs} lbs</p>

    <p>
      ${washFoldTotal.toFixed(2)}
    </p>
  </>
) : (
  <>
    <p>
  ${washFoldBagPrice.toFixed(2)} per bag
</p>

<p
  style={{
    fontSize: "14px",
    color: "#666",
    marginTop: "5px"
  }}
>
  One bag holds approximately 15–20 lbs of laundry. A bag is a large kitchen bag.
</p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setWashFoldBags(
            Math.max(1, washFoldBags - 1)
          )
        }
      >
        -
      </button>

      <span>{washFoldBags}</span>

      <button
        onClick={() =>
          setWashFoldBags(
            washFoldBags + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      Total: $
      {washFoldTotal.toFixed(2)}
    </p>
  </>
)}
</>
          )}
</div>
      )}


        {services?.step1?.foldOnly?.active && (
  <div style={card}>
    <button
      onClick={() => setFoldOnly(!foldOnly)}
            style={{
              ...buttonBase,
              backgroundColor: foldOnly
                ? "#2563eb"
                : "#dbeafe",
              color: foldOnly
                ? "white"
                : "#1e3a8a"
            }}
          >
            Fold Only
          </button>

          {foldOnly && (
            <>
            <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "10px"
  }}
>
  {services?.step1?.foldOnly?.perPoundActive && (
    <button
      onClick={() => setFoldOnlyType("pound")}
      style={{
        ...buttonBase,
        backgroundColor:
          foldOnlyType === "pound"
            ? "#2563eb"
            : "#dbeafe",
        color:
          foldOnlyType === "pound"
            ? "white"
            : "#1e3a8a"
      }}
    >
      Per Pound
    </button>
  )}

  {services?.step1?.foldOnly?.perBagActive && (
    <button
      onClick={() => setFoldOnlyType("bag")}
      style={{
        ...buttonBase,
        backgroundColor:
          foldOnlyType === "bag"
            ? "#2563eb"
            : "#dbeafe",
        color:
          foldOnlyType === "bag"
            ? "white"
            : "#1e3a8a"
      }}
    >
      Per Bag
    </button>
  )}
</div>
              {foldOnlyType === "pound" ? (
  <>
    <p>${foldOnlyPrice.toFixed(2)} per lb</p>

    <input
      type="range"
      min="10"
      max="50"
      value={foldOnlyLbs}
      onChange={(e) =>
        setFoldOnlyLbs(
          Number(e.target.value)
        )
      }
    />

    <p>{foldOnlyLbs} lbs</p>

    <p>
      ${foldOnlyTotal.toFixed(2)}
    </p>
  </>
) : (
  <>
    <p>
      ${foldOnlyBagPrice.toFixed(2)} per bag
    </p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setFoldOnlyBags(
            Math.max(1, foldOnlyBags - 1)
          )
        }
      >
        -
      </button>

      <span>{foldOnlyBags}</span>

      <button
        onClick={() =>
          setFoldOnlyBags(
            foldOnlyBags + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      Total: $
      {foldOnlyTotal.toFixed(2)}
    </p>
  </>
)}
            </>
          )}
        </div>
)}

       {washFold && (
  <div style={card}>
    <h3>
      Wash & Fold Bedding Sets (${washFoldBeddingPrice.toFixed(2)} each)
    </h3>

    <div style={counterRow}>
      <button
        onClick={() =>
          setWashFoldBedding(
            Math.max(0, washFoldBedding - 1)
          )
        }
      >
        -
      </button>

      <span>{washFoldBedding}</span>

      <button
        onClick={() =>
          setWashFoldBedding(
            washFoldBedding + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      ${washFoldBeddingTotal.toFixed(2)}
    </p>
  </div>
)}

{foldOnly && (
  <div style={card}>
    <h3>
      Fold Only Bedding Sets (${foldOnlyBeddingPrice.toFixed(2)} each)
    </h3>

    <div style={counterRow}>
      <button
        onClick={() =>
          setFoldOnlyBedding(
            Math.max(0, foldOnlyBedding - 1)
          )
        }
      >
        -
      </button>

      <span>{foldOnlyBedding}</span>

      <button
        onClick={() =>
          setFoldOnlyBedding(
            foldOnlyBedding + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      ${foldOnlyBeddingTotal.toFixed(2)}
    </p>
  </div>
)}

         {washFold && (
  <div style={card}>
    <h3>Wash & Fold Oversized Items</h3>

    <p>
      Down Comforter (${washFoldComforterPrice})
    </p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setWashFoldComforter(
            Math.max(
              0,
              washFoldComforter - 1
            )
          )
        }
      >
        -
      </button>

      <span>{washFoldComforter}</span>

      <button
        onClick={() =>
          setWashFoldComforter(
            washFoldComforter + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
  ${washFoldComforterTotal.toFixed(2)}
</p>

<p>
  Sleeping Bag (${washFoldSleepingBagPrice})
</p>

<div style={counterRow}>
  <button
    onClick={() =>
      setWashFoldSleepingBag(
        Math.max(
          0,
          washFoldSleepingBag - 1
        )
      )
    }
  >
    -
  </button>

  <span>{washFoldSleepingBag}</span>

  <button
    onClick={() =>
      setWashFoldSleepingBag(
        washFoldSleepingBag + 1
      )
    }
  >
    +
  </button>
</div>

<p>
  ${washFoldSleepingBagTotal.toFixed(2)}
</p>

<p>
  Area Rug (${washFoldRugPrice})
</p>

<div style={counterRow}>
  <button
    onClick={() =>
      setWashFoldRug(
        Math.max(
          0,
          washFoldRug - 1
        )
      )
    }
  >
    -
  </button>

  <span>{washFoldRug}</span>

  <button
    onClick={() =>
      setWashFoldRug(
        washFoldRug + 1
      )
    }
  >
    +
  </button>
</div>

<p>
  ${washFoldRugTotal.toFixed(2)}
</p>

</div>
)}

{foldOnly && (
  <div style={card}>
    <h3>Fold Only Oversized Items</h3>

    <p>
      Down Comforter (${foldOnlyComforterPrice})
    </p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setFoldOnlyComforter(
            Math.max(
              0,
              foldOnlyComforter - 1
            )
          )
        }
      >
        -
      </button>

      <span>{foldOnlyComforter}</span>

      <button
        onClick={() =>
          setFoldOnlyComforter(
            foldOnlyComforter + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      ${foldOnlyComforterTotal.toFixed(2)}
    </p>

    <p>
      Sleeping Bag (${foldOnlySleepingBagPrice})
    </p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setFoldOnlySleepingBag(
            Math.max(
              0,
              foldOnlySleepingBag - 1
            )
          )
        }
      >
        -
      </button>

      <span>{foldOnlySleepingBag}</span>

      <button
        onClick={() =>
          setFoldOnlySleepingBag(
            foldOnlySleepingBag + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      ${foldOnlySleepingBagTotal.toFixed(2)}
    </p>

    <p>
      Area Rug (${foldOnlyRugPrice})
    </p>

    <div style={counterRow}>
      <button
        onClick={() =>
          setFoldOnlyRug(
            Math.max(
              0,
              foldOnlyRug - 1
            )
          )
        }
      >
        -
      </button>

      <span>{foldOnlyRug}</span>

      <button
        onClick={() =>
          setFoldOnlyRug(
            foldOnlyRug + 1
          )
        }
      >
        +
      </button>
    </div>

    <p>
      ${foldOnlyRugTotal.toFixed(2)}
    </p>
  </div>
)}

<div style={card}>
  <h3>Oversized Items</h3>

          <p>Other</p>

          <div style={counterRow}>
            <button
              onClick={() =>
                setOtherCount(
                  Math.max(0, otherCount - 1)
                )
              }
            >
              -
            </button>

            <span>{otherCount}</span>

            <button
              onClick={() => {
                setOtherCount(otherCount + 1);
                setShowOtherInput(true);
              }}
            >
              +
            </button>
          </div>

          {showOtherInput && (
            <div style={{ marginTop: "15px" }}>
              <input
                placeholder="Describe item"
                value={otherText}
                onChange={(e) =>
                  setOtherText(
                    e.target.value
                  )
                }
                style={{
                  padding: "8px",
                  width: "90%"
                }}
              />

              <div
                style={{
                  marginTop: "10px"
                }}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={otherConfirmed}
                    onChange={() =>
                      setOtherConfirmed(
                        !otherConfirmed
                      )
                    }
                  />{" "}
                  I understand that this item
                  requires Hustle & Fold Admin approval before
                  washing.
                </label>
              </div>
            </div>
          )}

          <p style={{ marginTop: "15px" }}>
  Total:
  ${total.toFixed(2)}
</p>

          <button
            onClick={handleNext}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white"
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}