import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ENUMS } from "../../common/constants";
import GoodsReceivingNoteDetails from "./common/GoodsReceivingNoteDetails";
import proposalHandler from "../Proposal/constants/handler";
import suppliersHandler from "../Suppliers/constants/handler";
import handler from "./constants/handler";
import { notifyError } from "../../common/helper";

const SingleGoodsReceivingNoteDetails = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { isEdit = false } = props;
  const { goodsReceivingNotesId } = useParams();
  const [initialValues, setInitialValues] = useState({});
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [proposalDetails, setProposalDetails] = useState([]);

  const { fetchSingleProposal } = useMemo(
    () => proposalHandler(dispatch, props),
    [dispatch, props]
  );
  const { fetchSuppliers } = useMemo(() => suppliersHandler(dispatch, props), [
    dispatch,
    props,
  ]);
  const {
    fetchSingleGoodsReceivingNotes,
    editGoodsReceivingNote,
    addGoodsReceivingDetails,
    deleteGoodsReceivingDetails,
    editGoodsReceivingDetails,
  } = useMemo(() => handler(dispatch, props), [dispatch, props]);

  const getSingleGoodsReceivingNotes = useCallback(
    async (goodsReceivingNotesId) => {
      const result = await fetchSingleGoodsReceivingNotes(
        goodsReceivingNotesId
      );
      if (result) {
        setInitialValues(result);
      } else {
        history.push("/404");
      }
    },
    [fetchSingleGoodsReceivingNotes, history, setInitialValues]
  );

  useEffect(() => {
    getSingleGoodsReceivingNotes(goodsReceivingNotesId);
  }, [goodsReceivingNotesId]);

  const getProposal = useCallback(
    async (purchaseProposalFormId) => {
      const result = await fetchSingleProposal(purchaseProposalFormId);
      if (result) {
        setProposalDetails(result.purchaseProposalDetails);
      } else {
        history.push("/404");
      }
    },
    [fetchSingleProposal, history]
  );

  useEffect(() => {
    if (initialValues.purchaseProposalFormId) {
      getProposal(initialValues.purchaseProposalFormId);
    }
  }, [initialValues]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEditGoodsReceivingNotes = async (values) => {
    enqueueSnackbar(`Đang cập nhật sản phẩm...`, {
      variant: "info",
      key: "updating-goodsReceivingNotes",
      persist: true,
      preventDuplicate: true,
    });

    const result = await editGoodsReceivingNote({
      ...values,
      id: +goodsReceivingNotesId,
    });
    const details = await updateGoodsReceivingDetails(
      values.goodsReceivingDetails
    );
    closeSnackbar("updating-goodsReceivingNotes");
    if (result.id && details.length === 0) {
      enqueueSnackbar("Cập nhật thành công !", {
        variant: "success",
      });
      getSingleGoodsReceivingNotes(goodsReceivingNotesId);
    } else {
      let errors = { details };
      if (!result.id) errors["result"] = result;
      notifyError(enqueueSnackbar, errors);
    }
  };

  const updateGoodsReceivingDetails = async (goodsReceivingDetails = []) => {
    let createProduct = [];
    let updateProduct = [];
    let deleteProduct = [];

    let errors = [];

    goodsReceivingDetails.forEach((product) => {
      switch (product.action) {
        case "created":
          createProduct.push(product);
          break;
        case "updated":
          updateProduct.push(product);
          break;
        case "deleted":
          deleteProduct.push(product);
          break;
        default:
          break;
      }
    });

    if (createProduct.length > 0) {
      const result = await addGoodsReceivingDetails({
        goodsReceivingNoteId: +goodsReceivingNotesId,
        goodsReceivingDetails: [...createProduct],
      });
      if (result !== true) {
        errors.push(result?.ApiErr || result);
      }
    }

    // Delete Proposal Products
    if (deleteProduct.length > 0) {
      const result = await deleteGoodsReceivingDetails({
        goodsReceivingNoteId: +goodsReceivingNotesId,
        goodsReceivingDetailIds: [
          ...deleteProduct.map((product) => product.id),
        ],
      });
      if (result !== true) {
        errors.push(result?.ApiErr || result);
      }
    }

    // Update Proposal Products
    if (updateProduct.length > 0) {
      const result = await editGoodsReceivingDetails({
        goodsReceivingNoteId: +goodsReceivingNotesId,
        goodsReceivingDetails: [
          ...updateProduct.map((product) => ({
            id: product.id,
            quantity: product.quantity,
            description: product.description,
            singlePurchasePrice: product.singlePurchasePrice,
          })),
        ],
      });
      if (result !== true) {
        errors.push(result?.ApiErr || result);
      }
    }

    return errors;
  };

  return initialValues?.id ? (
    <GoodsReceivingNoteDetails
      initialValues={{
        ...initialValues,
        ...initialValues.product,
      }}
      proposalDetails={proposalDetails}
      isEdit={
        isEdit &&
        [
          ENUMS.GOOD_RECEIVING_STATUS.NEW,
          ENUMS.GOOD_RECEIVING_STATUS.PENDING,
          ENUMS.GOOD_RECEIVING_STATUS.APPROVED,
        ].indexOf(initialValues.status) !== -1
      }
      onSubmit={(values) => isEdit && handleEditGoodsReceivingNotes(values)}
    />
  ) : (
    <h1>Loading</h1>
  );
};

export default SingleGoodsReceivingNoteDetails;
