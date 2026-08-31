import { CircleCheck, ExternalLink, LoaderCircle, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import {
  appendMapsUrlToAddress,
  buildMapsUrl,
  extractMapsUrlFromAddress,
} from "@/lib/geo";
import { highlightAddressField } from "@/lib/highlightAddressField";

import { Button } from "@/components/ui/button";

import { useTranslation } from "@/hooks/useTranslation";

// Duck-typed subset of react-hook-form's UseFormReturn — avoids depending on
// the react-hook-form package just for a type, while staying structurally
// compatible with the real form instance the host passes in.
interface PatientRegistrationFormLike {
  getValues: (name: string) => unknown;
  setValue: (
    name: string,
    value: unknown,
    options?: { shouldDirty?: boolean; shouldValidate?: boolean },
  ) => void;
  watch: (name: string) => unknown;
}

interface PatientLocationCaptureProps {
  form: PatientRegistrationFormLike;
}

type CaptureStatus = "idle" | "loading" | "success" | "error";

export default function PatientLocationCapture({
  form,
}: PatientLocationCaptureProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<CaptureStatus>("idle");
  const [message, setMessage] = useState("");
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);

  // The host loads an existing patient's address asynchronously (after its own
  // fetch + form.reset()), so watch reactively instead of only checking once at mount.
  const watchedAddress = String(form.watch("address") ?? "");
  useEffect(() => {
    const url = extractMapsUrlFromAddress(watchedAddress);
    setMapsUrl(url);
    setStatus((prev) => (url ? "success" : prev === "success" ? "idle" : prev));
    if (url) {
      setMessage(t("current_location_captured"));
    }
  }, [watchedAddress, t]);

  const handleCapture = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage(t("geolocation_not_supported"));
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const url = buildMapsUrl(
          position.coords.latitude,
          position.coords.longitude,
        );
        const address = String(form.getValues("address") ?? "");
        const updatedAddress = appendMapsUrlToAddress(address, url);

        form.setValue("address", updatedAddress, {
          shouldDirty: true,
          shouldValidate: true,
        });

        if (form.getValues("permanent_address_same_as_address")) {
          form.setValue("permanent_address", updatedAddress, {
            shouldDirty: true,
          });
        }

        setMapsUrl(url);
        setStatus("success");
        setMessage(t("current_location_captured"));
        highlightAddressField();
      },
      (error) => {
        setStatus("error");
        setMessage(`${t("unable_to_get_current_location")}${error.message}`);
      },
      { timeout: 10000 },
    );
  };

  return (
    <div className="care-patient-geo-fe-container order-last flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        {status === "success" && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
            <CircleCheck className="size-5 text-primary-700" />
          </span>
        )}
        <div className="min-w-0 text-sm">
          {status === "success" ? (
            <p className="flex flex-wrap items-center gap-x-2 font-medium text-primary-700">
              <span>{message}</span>
              {mapsUrl && (
                <>
                  <span className="text-gray-300">·</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline underline-offset-2"
                  >
                    {t("view_on_map")}
                    <ExternalLink className="size-3.5" />
                  </a>
                </>
              )}
            </p>
          ) : status === "error" ? (
            <p className="text-red-600">{message}</p>
          ) : (
            <p className="flex flex-wrap items-center gap-x-2 font-medium">
              {t("current_location_caption")}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden h-8 w-px bg-gray-200 sm:block" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={status === "loading"}
          onClick={handleCapture}
          className="gap-2 font-semibold bg-primary-100 border border-primary-400"
        >
          {status === "loading" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" />
          )}
          {status === "loading"
            ? t("capturing_location")
            : status === "success"
              ? t("update_location")
              : t("capture_current_location")}
        </Button>
      </div>
    </div>
  );
}
