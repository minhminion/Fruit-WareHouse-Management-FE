import React, { useEffect } from "react";
import {
  Grid,
  makeStyles,
  InputLabel,
  Box,
  Paper,
  Button,
  TextField,
} from "@material-ui/core";
import clsx from "clsx";
import { blueGrey } from "@material-ui/core/colors";
import { useHistory } from "react-router-dom";
import { useForm } from "../../../common/hooks/useForm";
import CKEditor from "@ckeditor/ckeditor5-react";
import Editor from "../../../common/components/widget/Editor";
import Alert from "@material-ui/lab/Alert";

// Helper
import { ENUMS } from "../../../common/constants";
import parse from "html-react-parser";
import useConfirm from "../../../common/hooks/useConfirm/useConfirm";
import GoodsReceivingNoteStatusStepper from "./components/GoodsReceivingNoteStatusStepper";
import GoodsReceivingNoteStatus from "./components/GoodsReceivingNoteStatus";
import ListGoodsReceivingNoteProducts from "./components/ListGoodsReceivingNoteProducts";
import GoodsReceivingNoteSupplier from "./components/GoodsReceivingNoteSupplier";
import { formatNumberToVND } from "../../../common/helper";
import { useSelector } from "react-redux";
import { MODULE_NAME as MODULE_SUPPLIERS } from "../../Suppliers/constants/models";

const defaultValues = {
  creator: "231",
  createdAt: Date.now(),
  period: 2,
  status: ENUMS.GOOD_RECEIVING_STATUS.NEW,
  description: "",
  supplierId: 0,
  totalPrice: 0,
  goodsReceivingDetails: [],
};


const useStyles = makeStyles((theme) => ({
  root: {
    "& label + .MuiInput-formControl": {
      marginTop: theme.spacing(3),
      // marginBottom: theme.spacing(2),
    },
    "& .MuiFormControl-marginNormal": {
      marginTop: 0,
    },
    "& .MuiAlert-message p": {
      margin: 0,
    },
  },
  leftSide: {
    width: "calc(100% - 700px)",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  rightSide: {
    width: 700,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  margin: {
    margin: theme.spacing(1),
  },
  label: {
    color: `#18202c !important `,
    fontWeight: 500,
    fontSize: 16,
    "&:focus:not($disabled)": {
      color: blueGrey[500],
    },
    "&.MuiInputLabel-shrink": {
      transform: "scale(1)",
    },
  },
  inputRoot: {
    width: "100%",
    borderRadius: theme.spacing(1),
    border: "1px solid rgba(0,0,0,.1)",
    backgroundColor: theme.palette.common.white,
    boxShadow: theme.boxShadows.main,
    "&:hover:not($disabled)": {
      // borderColor: blueGrey[500],
      boxShadow: theme.boxShadows.hover,
    },
    "& > svg": {
      color: blueGrey[300],
    },
    "&.MuiFormLabel-root.Mui-disabled": {
      color: blueGrey[300],
    },
    "&.Mui-error": {
      borderColor: theme.palette.error.main,
    },
  },
  input: {
    padding: "0.625rem 0.5rem",
  },
  inputDisabled: {
    color: theme.palette.common.black,
  },
  productDescription: {
    marginBottom: theme.spacing(3),
    "& .ck-editor": {
      boxShadow: theme.boxShadows.main,
    },
    "& .ck-toolbar": {
      border: theme.border[0],
      borderTopRightRadius: `${theme.spacing(1)}px !important`,
      borderTopLeftRadius: `${theme.spacing(1)}px !important`,
    },
    "& .ck-editor__editable.ck-editor__editable_inline": {
      borderBottomRightRadius: `${theme.spacing(1)}px !important`,
      borderBottomLeftRadius: `${theme.spacing(1)}px !important`,
      minHeight: 200,
      height: "100%",
      maxHeight: 400,
      "&:not(.ck-focused)": {
        border: theme.border[0],
      },
    },
  },
  datePicker: {
    minWidth: 300,
    background: "white",
    border: "1px solid rgba(0,0,0,.1)",
    borderRadius: 8,
    padding: theme.spacing(1.5),
    boxShadow: theme.boxShadows.main,
    "&:focus": {
      borderRadius: 8,
      background: "white",
    },
  },
  actionButton: {
    background: theme.palette.secondary.main,
    width: 120,
    color: theme.palette.common.white,
    justifyContent: "center",
    "&:hover": {
      background: theme.palette.secondary.main,
    },
    "&.btn__cancel": {
      background: "none",
      color: theme.palette.common.black,
    },
    "&.btn__reset": {
      background: theme.palette.info.light,
      color: theme.palette.common.white,
    },
  },
}));

const GOOD_RECEIVING_STATUS = ENUMS.GOOD_RECEIVING_STATUS;

const GoodsReceivingNoteDetails = ({
  proposalDetails,
  initialValues,
  isEdit = true,
  onSubmit,
  okLabel = "Cập nhật",
  resetLabel = "Làm mới",
  cancelLabel = "Hủy",
}) => {
  let minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const classes = useStyles();
  const history = useHistory();
  const confirm = useConfirm();
  const { data: suppliers } = useSelector(
    (state) => state[MODULE_SUPPLIERS].data
  );
  const validate = (fieldValues = values) => {
    let temp = { ...errors };
    setErrors({
      ...temp,
    });
    if (fieldValues === values)
      return Object.values(temp).every((x) => x === "");
  };

  const {
    values,
    errors,
    setErrors,
    handleInputChange,
    setDefaultValues,
  } = useForm(
    initialValues
      ? {
          ...defaultValues,
          ...initialValues,
        }
      : {
          ...defaultValues,
        },
    true,
    validate
  );

  useEffect(() => {
    handleResetValues();
  }, [initialValues]);

  const handleResetValues = () => {
    if (initialValues) {
      setDefaultValues(initialValues);
    } else {
      setDefaultValues(defaultValues);
    }
  };

  const getStatusConfirmContent = (value) => {
    let content = {
      title: "Thay đổi trạng thái phiếu nhập hàng ?",
      description: "Hành động này sẽ không thể hoàn tác",
      confirmationText: "Xác nhận",
      cancellationText: "Hủy",
    };
    switch (value) {
      case GOOD_RECEIVING_STATUS.CANCELED:
        content = {
          ...content,
          input: true,
          inputLabel: "Lý do",
        };
        break;
      default:
        break;
    }

    return content;
  };

  const getTotalPrice = (products) => {
    return products.reduce((totalPrice, receivingProduct) => {
      if (receivingProduct.action === "deleted") return totalPrice;
      const total =
        +(receivingProduct.singlePurchasePrice + "").replace(/,/g, "") *
        parseFloat(receivingProduct.quantity);
      return totalPrice + Math.round(total);
    }, 0);
  };

  const handleChangeStatus = (e) => {
    const { value: status } = e.target;

    confirm(getStatusConfirmContent(status))
      .then((inputValue) => {
        let newValue = {
          ...initialValues,
          status: status,
          ...(inputValue ? { exceptionReason: inputValue } : {}),
        };
        onSubmit && onSubmit(newValue);
      })
      .catch(() => {
        /* ... */
      });
  };

  const handleSubmit = () => {
    if (validate()) {
      try {
        const newValues = {
          description: values.description || "",
          status: values.status,
          ...(values.supplierId !== 0
            ? {
                supplierId: values.supplierId,
              }
            : {
                supplierName: values.supplierName,
              }),
          goodsReceivingDetails: values.goodsReceivingDetails.map(
            (product) => ({
              id: product.id || -1,
              productId: +product.productId,
              quantity: parseFloat(product.quantity),
              description: product.description || "",
              action: product.action,
              singlePurchasePrice: +(product.singlePurchasePrice + "").replace(
                /,/g,
                ""
              ),
            })
          ),
        };
        onSubmit && onSubmit(newValues);
      } catch (error) {}
    }
  };

  return (
    <Box className={classes.root}>
      {values.status === ENUMS.GOOD_RECEIVING_STATUS.CANCELED && (
        <Box clone mb={2}>
          <Alert severity="error">
            {parse(initialValues?.exceptionReason || "")}
          </Alert>
        </Box>
      )}
      {values.id && <GoodsReceivingNoteStatusStepper status={values.status} />}

      <Grid container spacing={3}>
        <Grid item className={clsx(classes.root, classes.leftSide)}>
          {/* Product Deadline and Status */}

          <Box
            className={classes.productDescription}
            display="flex"
            justifyContent="space-between"
          >
            <GoodsReceivingNoteStatus
              value={values.status}
              onChange={handleChangeStatus}
              classes={classes}
              isEdit={isEdit && values.id}
              style={{ width: "35%", minWidth: 50 }}
            />
            {/* Goods Receiving Notes Total Price */}
            <TextField
              disabled
              name="name"
              style={{
                width: "60%",
                minWidth: "calc(70% - 50px)",
                marginBottom: 24,
              }}
              label={"Tổng giá phiếu"}
              value={formatNumberToVND(
                getTotalPrice(values.goodsReceivingDetails) || values.totalPrice
              )}
              margin={"normal"}
              InputLabelProps={{
                classes: {
                  root: classes.label,
                },
                focused: false,
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  input: classes.input,
                  disabled: classes.inputDisabled,
                },
                style: { height: 45 },
                disableUnderline: true,
              }}
            />
          </Box>

          <GoodsReceivingNoteSupplier
            value={{
              id: values.supplierId,
              name: values.supplierName,
            }}
            onChange={handleInputChange}
            classes={classes}
            isEdit={isEdit && values.status === GOOD_RECEIVING_STATUS.NEW}
            style={{ width: "100%", minWidth: 200 }}
            suppliers={suppliers}
          />

          {(initialValues?.description || isEdit) && (
            <Box className={classes.productDescription}>
              <InputLabel className={classes.label} style={{ marginBottom: 8 }}>
                Mô tả phiếu nhập hàng
              </InputLabel>
              {isEdit ? (
                <CKEditor
                  editor={Editor}
                  data={values.description || ""}
                  onInit={(editor) => {
                    // You can store the "editor" and use when it is needed.
                  }}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    handleInputChange({
                      target: { name: "description", value: data },
                    });
                  }}
                  onBlur={(event, editor) => {}}
                  onFocus={(event, editor) => {}}
                />
              ) : (
                <Box p={2} className="product__description" component={Paper}>
                  {parse(values.description || "")}
                </Box>
              )}
            </Box>
          )}
          {/* Actions Button */}
          {isEdit && (
            <Box className={classes.productDescription}>
              <Box p={1.5} mr={1} clone>
                <Button
                  // variant="contained"
                  className={classes.actionButton}
                  component={Paper}
                  onClick={handleSubmit}
                >
                  {okLabel}
                </Button>
              </Box>
              <Box p={1.5} mr={1} clone>
                <Button
                  // variant="contained"
                  className={clsx(classes.actionButton, "btn__reset")}
                  component={Paper}
                  onClick={handleResetValues}
                >
                  {resetLabel}
                </Button>
              </Box>
              <Box p={1.5} mr={1} clone>
                <Button
                  className={clsx(classes.actionButton, "btn__cancel")}
                  component={Paper}
                  onClick={() => history.push("/proposal")}
                >
                  {cancelLabel}
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
        <Grid item className={clsx(classes.root, classes.rightSide)}>
          <Box className={classes.productDescription}>
            {/* <InputLabel className={classes.label} style={{ marginBottom: 8 }}>
              Danh sách sản phẩm
            </InputLabel> */}
            <ListGoodsReceivingNoteProducts
              listProduct={proposalDetails}
              isEdit={isEdit && values.status === ENUMS.PROPOSAL_STATUS.NEW}
              status={GOOD_RECEIVING_STATUS}
              data={values.goodsReceivingDetails}
              supplierId={values.supplierId}
              errors={errors}
              onChange={handleInputChange}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GoodsReceivingNoteDetails;
