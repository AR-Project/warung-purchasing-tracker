import db from "@/infrastructure/database/db";
import { safePromise } from "@/lib/utils/safePromise";

export const flag = {
  userRegistration: async (): Promise<boolean> => {
    const DEFAULT_VALUE = true;
    const { data: userRegistrationStatus } = await safePromise(
      db.query.featureFlag.findFirst({
        where: (flag, { eq }) => eq(flag.name, "user_registration"),
      })
    );
    return userRegistrationStatus
      ? userRegistrationStatus.isEnabled
      : DEFAULT_VALUE;
  },
};
