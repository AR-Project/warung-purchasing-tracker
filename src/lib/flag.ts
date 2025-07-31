import db from "@/infrastructure/database/db";

export const flag = {
  userRegistration: async (): Promise<boolean> => {
    const DEFAULT_VALUE = true;
    const userRegistrationStatus = await db.query.featureFlag.findFirst({
      where: (flag, { eq }) => eq(flag.name, "user_registration"),
    });

    return userRegistrationStatus
      ? userRegistrationStatus.isEnabled
      : DEFAULT_VALUE;
  },
};
