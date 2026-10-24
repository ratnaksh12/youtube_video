# Facts behind "Your battery percentage is a guess"

Every claim in the narration, its source, and how the film words it. Searched October 2026.

| Line | Claim | Source and what it says |
|---|---|---|
| l03 | A small chip, the **fuel gauge**, estimates the charge. Nothing measures the charge directly. | MakeTechEasier, [How phone battery percentage works](https://maketecheasier.com/how-phone-battery-percentage-works/): a fuel-gauge chip estimates the percentage from current, voltage, temperature and a model of the cell. Embedded.com, [Accurate measurement of battery state-of-charge](https://www.embedded.com/?p=4458377). |
| l04 | It **counts the charge** flowing in and out (coulomb counting). | Same sources: a sense resistor turns current into a voltage, and the gauge totals charge in and out over time. Analog Devices ModelGauge m5 ([MAX17055 listing](https://www.mouser.ca/maxim-max17055-gauge)): "the short-term accuracy and linearity of a coulomb counter". |
| l05 | **Counting errors pile up** over time. | Coulomb counters accumulate offset drift, so small errors grow and need periodic recalibration when the battery is full, idle or empty (MakeTechEasier, Embedded.com). |
| l06 | It **also checks the voltage**. | Voltage-based estimation compares the cell's voltage with a stored voltage-to-charge curve. ModelGauge m5 adds "the long-term stability of a voltage-based fuel gauge" (MAX17055 listing). |
| l07 | Through the **middle of the charge the voltage barely moves**. | Patent US 10459035 ([PDF](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10459035)): in a flat portion of the voltage profile "the same voltage can represent a large SOC range". The mid-charge region is the hardest for voltage-based estimation ([zbotic](https://zbotic.in/?p=597568), vendor source). The film's curve is drawn as a typical graphite Li-ion curve and labelled *typical*, with no voltage values on it. |
| l08 | It **blends both, using a model** that accounts for **temperature, age and load**. | MAX17055: "automatically compensates for cell aging, temperature, and discharge rate". |
| l09–l10 | When conditions don't fit, the estimate is **corrected**, so **15% can become 3% within a minute**. | MakeTechEasier: software "can revise a reading from 15 percent to 3 percent within a minute" when conditions no longer fit the earlier estimate. |
| l10 | A **cold phone can die at 30%**. | Orchard, [Why your iPhone battery dies in cold weather](https://www.getorchard.com/blog/iphone-battery-dies-in-cold-weather): an iPhone can suddenly die despite reporting 30%. Apple, [If your iPhone or iPad gets too hot or too cold](https://support.apple.com/118431): below its 0–35 °C operating range, an iPhone may temporarily lose battery life and turn off. |
| l11 | **0% isn't empty**: the phone stops at a cut-off point to protect the battery. | Wikipedia, [Cutoff voltage](https://en.wikipedia.org/wiki/Cutoff_voltage): the voltage at which a battery is considered fully discharged, "beyond which further discharge could cause harm"; phones shut down automatically when it is reached. |

## Values shown on screen (illustrative, labelled as such where they could be read as data)
- **62%, 15% → 3%, 30%, 0%, 1%**: example readings taken from the narration.
- **3.85 V**: a typical mid-charge reading for a phone Li-ion cell (nominal 3.7–3.87 V).
- **31 °C, 412 cycles, 2.4 W**: example values for one fictional handset's temperature, age and load.
- **−8 °C**: an example cold reading, below Apple's 0 °C operating floor.
- The phone is a fictional handset with no real brand, silhouette or UI.
