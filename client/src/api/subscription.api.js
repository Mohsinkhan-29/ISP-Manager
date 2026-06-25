import api from "./axios";

export const getSubscriptions = () =>
  api.get("/subscriptions");

export const createSubscription = (data) =>
  api.post("/subscriptions", data);

export const updateStatus = (id, data) =>
  api.patch(`/subscriptions/${id}/status`, data);