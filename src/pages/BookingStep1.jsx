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

  const [washFoldLbs, setWashFoldLbs] = useState(10);
  const [foldOnlyLbs, setFoldOnlyLbs] = useState(10);

  const [beddingSets, setBeddingSets] = useState(0);

  const [comforter, setComforter] = useState(0);
  const [sleepingBag, setSleepingBag] = useState(0);
  const [rug, setRug] = useState(0);

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
  console.log(
  "FIRESTORE DATA:",
  JSON.stringify(snap.data(), null, 2)
);
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
console.log(
  "Wash Fold Price:",
  services?.step1?.washFold?.pricePerLb
);
  const foldOnlyPrice =
    Number(services?.step1?.foldOnly?.pricePerLb || 1);

  const beddingPrice =
    Number(services?.step1?.bedding?.price || 25);

  const comforterPrice =
    Number(
      services?.step1?.oversized?.comforter?.price || 18
    );

  const sleepingBagPrice =
    Number(
      services?.step1?.oversized?.sleepingBag?.price || 15
    );

  const rugPrice =
    Number(
      services?.step1?.oversized?.rug?.price || 20
    );

  const washFoldTotal =
    washFold ? washFoldLbs * washFoldPrice : 0;

  const foldOnlyTotal =
    foldOnly ? foldOnlyLbs * foldOnlyPrice : 0;

  const beddingTotal =
    beddingSets * beddingPrice;

  const comforterTotal =
    comforter * comforterPrice;

  const sleepingBagTotal =
    sleepingBag * sleepingBagPrice;

  const rugTotal =
    rug * rugPrice;

  const oversizedTotal =
    comforterTotal +
    sleepingBagTotal +
    rugTotal;

  const total =
    washFoldTotal +
    foldOnlyTotal +
    beddingTotal +
    oversizedTotal;

  function handleNext() {
    if (
      !washFold &&
      !foldOnly &&
      beddingSets === 0 &&
      comforter === 0 &&
      sleepingBag === 0 &&
      rug === 0 &&
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
      foldOnlyLbs,
      beddingSets,
      comforter,
      sleepingBag,
      rug,
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
              <p>${washFoldPrice.toFixed(2)} per lb</p>

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
          )}
        </div>

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
          )}
        </div>

        <div style={card}>
          <h3>
            Bedding Sets (${beddingPrice.toFixed(2)} each)
          </h3>

          <div style={counterRow}>
            <button
              onClick={() =>
                setBeddingSets(
                  Math.max(0, beddingSets - 1)
                )
              }
            >
              -
            </button>

            <span>{beddingSets}</span>

            <button
              onClick={() =>
                setBeddingSets(beddingSets + 1)
              }
            >
              +
            </button>
          </div>

          <p>${beddingTotal.toFixed(2)}</p>
        </div>

        <div style={card}>
          <h3>Oversized Items</h3>

          <p>
            Down Comforter (${comforterPrice})
          </p>

          <div style={counterRow}>
            <button
              onClick={() =>
                setComforter(
                  Math.max(0, comforter - 1)
                )
              }
            >
              -
            </button>

            <span>{comforter}</span>

            <button
              onClick={() =>
                setComforter(comforter + 1)
              }
            >
              +
            </button>
          </div>

          <p>
            Sleeping Bag (${sleepingBagPrice})
          </p>

          <div style={counterRow}>
            <button
              onClick={() =>
                setSleepingBag(
                  Math.max(0, sleepingBag - 1)
                )
              }
            >
              -
            </button>

            <span>{sleepingBag}</span>

            <button
              onClick={() =>
                setSleepingBag(
                  sleepingBag + 1
                )
              }
            >
              +
            </button>
          </div>

          <p>
            Area Rug (${rugPrice})
          </p>

          <div style={counterRow}>
            <button
              onClick={() =>
                setRug(Math.max(0, rug - 1))
              }
            >
              -
            </button>

            <span>{rug}</span>

            <button
              onClick={() => setRug(rug + 1)}
            >
              +
            </button>
          </div>

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
                  requires approval before
                  washing.
                </label>
              </div>
            </div>
          )}

          <p style={{ marginTop: "15px" }}>
            Total:
            ${oversizedTotal.toFixed(2)}
          </p>
        </div>

        <h3
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#1e3a8a"
          }}
        >
          Total: ${total.toFixed(2)}
        </h3>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center"
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "20px"
          }}
        >
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