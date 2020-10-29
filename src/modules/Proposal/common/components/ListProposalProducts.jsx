import React, { Fragment, useState } from "react";
import {
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Box,
  Table,
  makeStyles,
  InputBase,
  IconButton,
  Button,
} from "@material-ui/core";
import { formatNumberToVND } from "../../../../common/helper";

import { blueGrey } from "@material-ui/core/colors";
import ListProductModal from "./ListProductModal";
import { CSSTransition, TransitionGroup } from "react-transition-group";

// Icons
import CloseIcon from "@material-ui/icons/Close";
import InsertCommentIcon from "@material-ui/icons/InsertComment";
import ProductItemDescription from "./ProductItemDescription";

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    width: "100%",
    border: "1px solid rgba(0,0,0,.1)",
    // "&:hover:not($disabled)": {
    //   boxShadow: theme.boxShadows.hover,
    // },
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
  tableRoot: {
    overflow: "hidden",
    borderSpacing: `0px ${theme.spacing(2)}px`,
    borderCollapse: "separate",
    paddingBottom: theme.spacing(2),
    "& .MuiPaper-rounded": {
      borderRadius: theme.spacing(3),
    },
    "& tr": {
      borderRadius: theme.spacing(3),
      boxShadow: theme.boxShadows.main,
    },
    "& th": {
      border: "0px solid rgba(0,0,0,.1)",
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    "& td": {
      border: "0px solid rgba(0,0,0,.1)",
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    "& td:first-child": {
      borderLeftWidth: 1,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    "& td:last-child": {
      borderRightWidth: 1,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    },
    "& th:first-child": {
      borderLeftWidth: 1,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    "& th:last-child": {
      borderRightWidth: 1,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    },
  },
  buttonAction: {
    width: "100%",
    borderRadius: theme.spacing(2),
    boxShadow: "none",
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.dark,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const ListProposalProducts = ({ data, onChange, isEdit = false }) => {
  const classes = useStyles();
  const [viewProduct, setViewProduct] = useState({});
  const [openListProduct, setOpenListProduct] = useState(false);

  const handleChangeProduct = (e, productId) => {
    const { name, value } = e.target;
    const fieldName = name.split("_")[0];
    const index = data.findIndex((product) => product.productId === productId);
    if (index === -1) return;
    let newProducts = data;
    newProducts[index] = {
      ...newProducts[index],
      [fieldName]: value,
      action: newProducts[index].action !== "created" ? "updated" : "created",
    };
    console.log(
      "======== Bao Minh: handleChangeProduct -> newProducts",
      newProducts
    );
    onChange({
      target: {
        name: "purchaseProposalDetails",
        value: newProducts,
      },
    });
  };

  const handleDeleteProduct = (productId, action) => {
    if (data) {
      let newUnits;
      if (action === "created") {
        newUnits = data.filter((unit) => unit.productId !== productId);
      } else {
        const index = data.findIndex((unit) => unit.productId === productId);
        newUnits = data;
        newUnits[index] = {
          ...newUnits[index],
          action: "deleted",
        };
      }
      onChange({
        target: {
          name: "purchaseProposalDetails",
          value: newUnits,
        },
      });
    }
  };

  const handleCloseViewProduct = () => {
    setViewProduct({});
  };

  const renderTableBody = (rows) => {
    return rows.map((row) => {
      const product = row.product;
      return (
        row.action !== "deleted" && (
          <CSSTransition key={product.id} timeout={500} classNames="fade">
            <TableRow>
              <TableCell align="left">
                <img
                  alt=""
                  src={
                    process.env.PUBLIC_URL +
                    "/images/products/delicious-banana-blue-background.jpg"
                  }
                  style={{
                    width: "100%",
                    borderRadius: 8,
                  }}
                />
              </TableCell>
              <TableCell component="th" scope="row">
                <strong>{product.name}</strong>
              </TableCell>
              <TableCell align="left">
                <InputBase
                  disabled={!isEdit}
                  name={`quantity_product_${product.id}`}
                  error={row.quantity.length === 0}
                  value={formatNumberToVND(row.quantity)}
                  classes={{
                    root: classes.inputRoot,
                    input: classes.input,
                    disabled: classes.inputDisabled,
                  }}
                  onChange={(e) => handleChangeProduct(e, product.id)}
                />
              </TableCell>
              {/* Action on row */}
              <TableCell align="center">
                <Box clone>
                  <IconButton onClick={() => setViewProduct(row)}>
                    <InsertCommentIcon />
                  </IconButton>
                </Box>
                {isEdit && (
                  <Box clone>
                    <IconButton
                      color="secondary"
                      onClick={() =>
                        handleDeleteProduct(product.id, row.action)
                      }
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          </CSSTransition>
        )
      );
    });
  };

  return (
    <Fragment>
      <TableContainer component={Box}>
        <Table
          className={classes.tableRoot}
          size="small"
          aria-label="simple table"
        >
          <TableHead>
            <TableRow>
              <TableCell style={{ width: 80 }} align="left"></TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell align="left" style={{ width: 150 }}>
                Số lượng mua
              </TableCell>
              <TableCell style={{ width: 130 }} align="center">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TransitionGroup component={TableBody} className="products-list">
            {data && renderTableBody(data)}
            {isEdit && (
              <CSSTransition in={true} timeout={500} classNames="fade">
                <TableRow>
                  <TableCell style={{ padding: 0 }} colSpan={4}>
                    <Button
                      className={classes.buttonAction}
                      onClick={() => setOpenListProduct(true)}
                    >
                      Thêm sản phẩm
                    </Button>
                  </TableCell>
                </TableRow>
              </CSSTransition>
            )}
          </TransitionGroup>
        </Table>
      </TableContainer>
      <ListProductModal
        open={openListProduct}
        onChange={onChange}
        onClose={() => setOpenListProduct(false)}
        initialValue={data || []}
      />
      <ProductItemDescription
        isEdit={isEdit}
        proposalProduct={viewProduct}
        onClose={handleCloseViewProduct}
        onSubmit={handleChangeProduct}
      />
    </Fragment>
  );
};

export default ListProposalProducts;
