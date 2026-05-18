import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadRecentConversions,
  MAX_RECENT_CONVERSIONS,
  pushRecentConversion,
} from "../lib/converterRecentHistory";

describe("converterRecentHistory", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("stores at most 4 conversions", async () => {
    for (let i = 1; i <= 6; i++) {
      await pushRecentConversion({
        amount: String(i),
        fromCurrency: "USD",
        toCurrency: "EUR",
        convertedAmount: String(i * 0.9),
      });
    }
    const list = await loadRecentConversions();
    expect(list).toHaveLength(MAX_RECENT_CONVERSIONS);
    expect(list[0].amount).toBe("6");
    expect(list[3].amount).toBe("3");
  });

  it("bumps duplicate pair+amount to top", async () => {
    await pushRecentConversion({
      amount: "100",
      fromCurrency: "USD",
      toCurrency: "EUR",
      convertedAmount: "90",
    });
    await pushRecentConversion({
      amount: "50",
      fromCurrency: "GBP",
      toCurrency: "AMD",
      convertedAmount: "25000",
    });
    await pushRecentConversion({
      amount: "100",
      fromCurrency: "USD",
      toCurrency: "EUR",
      convertedAmount: "91",
    });
    const list = await loadRecentConversions();
    expect(list).toHaveLength(2);
    expect(list[0].convertedAmount).toBe("91");
  });
});
