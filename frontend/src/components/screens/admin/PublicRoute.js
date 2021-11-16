import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";
    
const PrivateRoute = ({ component: Component, ...rest }) => {
  const logged = useSelector((state) => state.admin_user.isLoggedIn);
  return (
    <Route
      {...rest}
      render={(props) =>
        logged === false ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/admin/dashboard",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
