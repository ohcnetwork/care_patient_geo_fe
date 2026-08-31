import { lazy } from "react";

import routes from "./routes";

const PatientLocationCapture = lazy(
  () => import("./components/PatientLocationCapture"),
);

const manifest = {
  plugin: "care_patient_geo_fe",
  routes,
  components: {
    PatientRegistrationForm: PatientLocationCapture,
  },
} as const;

export default manifest;
