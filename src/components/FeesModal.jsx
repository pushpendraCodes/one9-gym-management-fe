import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Transition from "../utils/Transition";
import { CiSquareRemove } from "react-icons/ci";
import { useSelector } from "react-redux";
import {
  selectError,
  selectfeesHistory,
  selectMember,
  updateMemberFeesAsync,
} from "../features/member/MembersSlice";
import { selectLoggedGym } from "../features/Auth/AuthSlice";
import { useDispatch } from "react-redux";

function FeesModal({
  id,
  userId,
  modalOpen,
  reloaddata,
  setAlert,
  setModalOpen,
}) {
  const modalContent = useRef(null);

  const feesHistory = useSelector(selectfeesHistory);
  const selectedMember = useSelector(selectMember);
  const loggedGym = useSelector(selectLoggedGym);
  console.log(selectedMember, feesHistory, "selectedMember");
  const error = useSelector(selectError);
  let dispatch = useDispatch();
  const TotalSpent =
    feesHistory?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  const [type, setType] = useState(0);
  const [fees, setfees] = useState(0);
  const [method, setMethod] = useState("");

  console.log(type, fees, method, "type");

  useEffect(() => {
    setType(Number(selectedMember?.SubscriptionType));
  }, [selectedMember]);

  useEffect(() => {
    if (loggedGym && type && selectedMember) {
      const trainingType = Number(selectedMember.training); // Convert training to number
      const SubscriptionTypeNumber = Number(type); // Convert training to number

      // Map numeric SubscriptionType (enum) to the corresponding string
      let subscriptionTypeKey = "";
      switch (SubscriptionTypeNumber) {
        case 1:
          subscriptionTypeKey = "monthly";
          break;
        case 2:
          subscriptionTypeKey = "quarterly";
          break;
        case 3:
          subscriptionTypeKey = "yearly";
          break;
        default:
          console.error("Invalid SubscriptionType");
          return;
      }

      // Find the matching service based on the training type
      for (let i = 0; i < loggedGym?.servicesOffered?.length; i++) {
        if (loggedGym.servicesOffered[i].serviceName === trainingType) {
          console.log("Matching service found");

          const serviceChargeForType =
            loggedGym.servicesOffered[i].serviceCharge[subscriptionTypeKey]; // Get the charge based on the mapped subscription type

          if (serviceChargeForType) {
            setfees(serviceChargeForType);
          } else {
            console.error("No charge found for the selected subscription type");
          }
          break; // Exit loop once a match is found
        }
      }
    } else {
      setfees(selectedMember.fees);
      console.log("Gym, training, or subscription type not found");
    }
  }, [loggedGym, type, selectedMember]);

  const handelSubmit = async (e) => {
    e.preventDefault();
    // fees, SubscriptionType
    const data = {
      paymentMode: method,
      fees,
      SubscriptionType: type,
      id: userId,
    };
    try {
      await dispatch(updateMemberFeesAsync(data)).unwrap();
      setAlert({
        message: "Member fees updated successfully!",
        type: "success",
      });
      setModalOpen(false);
      reloaddata();
    } catch (err) {
      console.log(err, "err");
      setAlert({ message: `Error: ${error[0]?.msg || err}`, type: "error" });
    }
  };

  return (
    <>
      {/* Modal backdrop */}
      <Transition
        className="fixed inset-0 bg-gray-900 bg-opacity-30 z-50 transition-opacity"
        show={modalOpen}
        enter="transition ease-out duration-200"
        enterStart="opacity-0"
        enterEnd="opacity-100"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
        aria-hidden="true"
      />
      {/* Modal dialog */}
      <Transition
        id={id}
        className="fixed inset-0 z-50 overflow-hidden flex items-start top-20 mb-4 justify-center px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        show={modalOpen}
        enter="transition ease-in-out duration-200"
        enterStart="opacity-0 translate-y-4"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in-out duration-200"
        leaveStart="opacity-100 translate-y-0"
        leaveEnd="opacity-0 translate-y-4">
        <div
          ref={modalContent}
          className="bg-white dark:bg-gray-800 border border-transparent dark:border-gray-700/60 overflow-auto max-w-2xl w-full max-h-full rounded-lg shadow-lg">
          {/* Search form */}
          {/* <form className="border-b border-gray-200 dark:border-gray-700/60">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                Search
              </label>
              <input
                id={searchId}
                className="w-full dark:text-gray-300 bg-white dark:bg-gray-800 border-0 focus:ring-transparent placeholder-gray-400 dark:placeholder-gray-500 appearance-none py-3 pl-10 pr-4"
                type="search"
                placeholder="Search Anything…"
                ref={searchInput}
              />
              <button className="absolute inset-0 right-auto group" type="submit" aria-label="Search">
                <svg
                  className="shrink-0 fill-current text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 ml-4 mr-2"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5z" />
                  <path d="M15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </button>
            </div>
          </form> */}
          <div className="border-b my-3  border-gray-200 dark:border-gray-700/60">
            <div className="flex justify-end mx-2  cursor-pointer text-xl">
              <CiSquareRemove
                onClick={() => setModalOpen(false)}
                size={20}
                color="red"
              />
            </div>
            <h1 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
              {selectedMember.firstName + " " + selectedMember.lastName}
            </h1>
            <p className="">
              Joining Date - {new Date(selectedMember.createdAt).toDateString()}
            </p>
          </div>
          <div className="text-sm font-medium  text-white px-1 bg-emerald-400 rounded-full">
            {(selectedMember.training == 1 && "Cardio(m)") ||
              (selectedMember.training == 2 && "Cardio(f)") ||
              (selectedMember.training == 3 && "Strength") ||
              (selectedMember.training == 4 && "Personal Training") ||
              (selectedMember.training == 5 && "Group training") ||
              (selectedMember.training == 6 && "Yoga")}
          </div>
          <div className="flex justify-end mx-2">
            <p className="text-red-500">
              Fees Due Date -{new Date(selectedMember.dueDate).toDateString()}
            </p>
          </div>

          <form
            onSubmit={handelSubmit}
            className="flex my-5 gap-3 px-3 justify-between">
            <div className="flex flex-col gap-1">
              <label htmlFor="">Subscription Type</label>
              <select
                required
                placeholder="Select training type"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                name="training"
                value={type}
                onChange={(e) => setType(e.target.value)}
                id="">
                <option value="">select</option> {/* Ensure empty string */}
                <option value={1}>monthly</option>
                <option value={2}>quaterely</option>
                <option value={3}>yearly</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-left">Subscription Fees</p>
              <input
                value={fees}
                disabled
                type="number"
                placeholder="enter fees amount"
                className="w-full py-2 px-3 focus:outline-none border border-gray-300 focus:border-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-left">Pay Method</p>
              <select
                required
                onChange={(e) => setMethod(e.target.value)}
                className="w-full py-2 px-1 focus:outline-none border border-gray-300 focus:border-gray-300"
                name="pay"
                id="">
                <option value="">select</option> {/* Ensure empty string */}
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="flex items-center">
              <button
                type="submit"
                className="border my-7 text-white border-gray-300 py-2 px-5 bg-emerald-500">
                Update
              </button>
            </div>
          </form>

          <div className="py-1 px-2 mb-3">
            {/* Recent searches */}
            <div className="my-3 last:mb-0">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                Recent Payments
              </div>
              <ul className="text-sm max-h-[15rem] overflow-y-scroll">
                {feesHistory &&
                  feesHistory.map((item, i) => {
                    return (
                      <li key={item.id}>
                        <Link
                          className=" p-2 flex items-center justify-between text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                          to="#0"
                          // onClick={() => setModalOpen(!modalOpen)}
                        >
                          <div className="flex  items-center">
                            <svg
                              className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16">
                              <path d="M15.707 14.293v.001a1 1 0 01-1.414 1.414L11.185 12.6A6.935 6.935 0 017 14a7.016 7.016 0 01-5.173-2.308l-1.537 1.3L0 8l4.873 1.12-1.521 1.285a4.971 4.971 0 008.59-2.835l1.979.454a6.971 6.971 0 01-1.321 3.157l3.107 3.112zM14 6L9.127 4.88l1.521-1.28a4.971 4.971 0 00-8.59 2.83L.084 5.976a6.977 6.977 0 0112.089-3.668l1.537-1.3L14 6z" />
                            </svg>
                            <span>
                              {item.amount}rs -{" "}
                              {new Date(item.createdAt).toDateString()}{" "}
                            </span>
                          </div>
                          <div
                            className={`${
                              (item.paymentMode == "cash" && "bg-green-600") ||
                              (item.paymentMode == "card" && "bg-yellow-900") ||
                              (item.paymentMode == "upi" && "bg-gray-600")
                            } px-1 text-sm`}>
                            <span className="text-white">
                              {item.paymentMode}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
            <div>
              <p>Total Spent :{TotalSpent}rs</p>
            </div>
            {/* Recent pages */}
            {/* <div className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase px-2 mb-2">
                Recent pages
              </div>
              <ul className="text-sm">
                <li>
                  <Link
                    className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                    to="#0"
                    onClick={() => setModalOpen(!modalOpen)}>
                    <svg
                      className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16">
                      <path d="M14 0H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1zM3 2h10v8H9v4H3V2z" />
                    </svg>
                    <span>
                      <span className="font-medium">Messages</span> -{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        Conversation / … / Mike Mills
                      </span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/20 rounded-lg"
                    to="#0"
                    onClick={() => setModalOpen(!modalOpen)}>
                    <svg
                      className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-3"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16">
                      <path d="M14 0H2c-.6 0-1 .4-1 1v14c0 .6.4 1 1 1h8l5-5V1c0-.6-.4-1-1-1zM3 2h10v8H9v4H3V2z" />
                    </svg>
                    <span>
                      <span className="font-medium">Messages</span> -{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        Conversation / … / Eva Patrick
                      </span>
                    </span>
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </Transition>
    </>
  );
}

export default FeesModal;