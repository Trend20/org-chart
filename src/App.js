import React, { useEffect, useRef } from "react";

import { Tree, TreeNode } from "react-organizational-chart";
import _ from "lodash";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Search from "@material-ui/icons/Search";
import BusinessIcon from "@material-ui/icons/Business";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Avatar from "@material-ui/core/Avatar";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";
import organization from "./org.json";
import Select from "react-select";
import './App.css'
import {options} from './employees'

import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { placeholder } from "@babel/types";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "white",
    display: "inline-block",
    borderRadius: 16,
    maxWidth: 300,
  },
  expand: {
    transform: "rotate(0deg)",
    marginTop: -10,
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.short,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  avatar: {
    backgroundColor: "#ECECF4",
  },
}));

function Organization({ org, onCollapse, collapsed }) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "account",
    drop: () => ({ name: org.tradingName }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = canDrop && isOver;
  let backgroundColor = "white";
  if (isActive) {
    backgroundColor = "#ddffd2";
  } else if (canDrop) {
    backgroundColor = "#ffeedc";
  }

  return (
    <Card
      variant="outlined"
      className={classes.root}
      ref={drop}
      style={{ backgroundColor }}
    >
      <CardHeader
        avatar={
          <Tooltip
            title={`${_.size(
              org.organizationChildRelationship
            )} Sub Profile, ${_.size(org.account)} Sub Account`}
            arrow
          >
            <Badge
              style={{ cursor: "pointer" }}
              color="secondary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              showZero
              invisible={!collapsed}
              overlap="circle"
              badgeContent={_.size(org.organizationChildRelationship)}
              onClick={onCollapse}
            >
              <Avatar className={classes.avatar}>
                {/* <BusinessIcon color="primary" /> */}
              </Avatar>
            </Badge>
          </Tooltip>
        }
        style={{ width: "200px" }}
        title={`${org.FirstName}  ${org.LastName}, ${org.Title}`}
      />

      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleClose}>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <BusinessIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Add Sub Profile" />
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountBalanceIcon color="secondary" />
          </ListItemIcon>
          <ListItemText primary="Add Sub Account" />
        </MenuItem>
      </Menu>
      <IconButton
        size="small"
        onClick={onCollapse}
        className={clsx(classes.expand, {
          [classes.expandOpen]: !collapsed,
        })}
      >
        <ExpandMoreIcon />
      </IconButton>
    </Card>
  );
}
function Account({ a }) {
  const classes = useStyles();
  const [{ isDragging }, drag] = useDrag({
    item: { name: a.name, type: "account" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        alert(`You moved ${item.name} to ${dropResult.name}`);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0.4 : 1;
  return (
    <Card
      variant="outlined"
      className={classes.root}
      ref={drag}
      style={{ cursor: "pointer", opacity }}
    >
      <CardHeader
        avatar={
          <Avatar className={classes.avatar}>
            {/* <AccountBalanceIcon color="secondary" /> */}
          </Avatar>
        }
        title={a.name}
      />
    </Card>
  );
}

function Product({ p }) {
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        <Typography variant="subtitle2">{p.name}</Typography>
      </CardContent>
    </Card>
  );
}

function Node({ o, parent }) {
  const [collapsed, setCollapsed] = React.useState(o.collapsed);
  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };
  React.useEffect(() => {
    o.collapsed = collapsed;
  });
  const T = parent
    ? TreeNode
    : (props) => (
        <Tree
          {...props}
          lineWidth={"2px"}
          lineColor={"#bbc"}
          lineBorderRadius={"12px"}
        >
          {props.children}
        </Tree>
      );
  return collapsed ? (
    <T
      label={
        <Organization
          org={o}
          onCollapse={handleCollapse}
          collapsed={collapsed}
        />
      }
    />
  ) : (
    <T
      label={
        <Organization
          org={o}
          onCollapse={handleCollapse}
          collapsed={collapsed}
        />
      }
    >
      {_.map(o.account, (a) => (
        <TreeNode label={<Account a={a} />}>
          <TreeNode label={<Product p={a.product} />} />
        </TreeNode>
      ))}
      {_.map(o.organizationChildRelationship, (c) => (
        <Node o={c} parent={o} />
      ))}
    </T>
  );
}
// card themes
const theme = createMuiTheme({
  palette: {
    background: "#fff",
  },
  fontFamily: "Roboto, sans-serif",
});

// search options
// const options = [
//   { value: "chocolate", label: `Anyungu Wanyungu, Software +254 722173654` },
//   { value: "strawberry", label: "Enock Muchai, Software +254 722173654" },
//   { value: "vanilla", label: "Snowflake Iota, Business iota@mezy.com" },
//   { value: "vanilla", label: "Opta Miles, Business miles@mezy.com" },
//   { value: "vanilla", label: "Chelin White, Credits chelin@mezy.com" },
//   { value: "vanilla", label: "Tealord Hall, Sales +08 914657" },
//   { value: "vanilla", label: "Viola Ximenia, Sales laura@mezy.com" },
//   { value: "vanilla", label: "Robin Hood, security robin@mezy.com" },
//   { value: "vanilla", label: "Pete Fou, exec, robin@mezy.com, +254 2222222" },
// ];

// search bar styles
const searchStyle = {
  control: (styles) => ({
    ...styles,
    width: "99%",
    fontSize: "1.5rem",
    position: "fixed",
    padding: "20px",
    backgroundColor: "#4d4d4d",
    border: "1px solid blue",
    borderRadius: "10px",
    marginRight: "10px",
  }),
  menu: (base, state) => ({
    ...base,
    marginTop: "90px",
    backgroundColor: "#4d4d4d",
  }),
  option: (base, state) => ({
    ...base,
    paddingTop: "10px",
    fontSize: "1.3rem",
    backgroundColor: state.isSelected ? "#ffff" : "#4d4d4d",
    color: state.isSelected ? "#4d4d4d" : "#ffff",
  }),
  placeholder: (styles) => ({ color: "#ffff", fontSize: "1.5rem" }),
  singleValue: (provided) => ({
    ...provided,
    color: "white",
  }),
};

// main component return
export default function App(props) {
  const ref = useRef(null);

  const scroll = () => {
    window.scrollTo({
      left: (ref.current.scrollLeft += Math.round(
        ref.current.scrollWidth / 2 - Math.round(ref.current.clientWidth / 2)
      )),
      behavior: "smooth",
    });
  };

  useEffect(() => {

    document.body.style.zoom = "100%";
    scroll();
  });
  return (
    <>
      <div style={{ zIndex: "99" }}>
        {/* marginTop: '50px', */}
        <Select
          options={options()}
          styles={searchStyle}
          placeholder="Search..."
          isClearable={true}
        />
      </div>
      <Card
        style={{
          width: "100%",
          height: "100%",
          zIndex: "-1",
          position: "absolute",
          marginTop: "200px",
          overflowX: "scroll",
        }}
        ref={ref}
      >
        <ThemeProvider theme={theme}>
          <Box
            bgcolor="background"
            padding={4}
            width="100%"
            height="100%"
            display="flex"
          >
            <DndProvider backend={HTML5Backend}>
              <Node o={organization} />
            </DndProvider>
          </Box>
        </ThemeProvider>
      </Card>
    </>
  );
}
