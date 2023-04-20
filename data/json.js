import fs from "fs";

export function ReadJSONFile() {
  let data = fs.readFileSync(productsFileJSON, "utf-8");
  let json = JSON.parse(data);

  return json;
}
