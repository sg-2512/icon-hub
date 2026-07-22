import React from "react";
import { addons, types } from "storybook/manager-api";
import { ADDON_ID, PANEL_ID } from "./constants";
import { IconSearchPanel } from "./Panel";

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "IconSearch",
    render: ({ active }) => (active ? <IconSearchPanel /> : null),
  });
});
