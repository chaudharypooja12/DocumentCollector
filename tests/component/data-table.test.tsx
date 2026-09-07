import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";

type Row = {
  id: string;
  name: string;
  country: string;
};

const rows: Row[] = Array.from({ length: 7 }, (_, index) => ({
  id: String(index + 1),
  name: `Applicant ${index + 1}`,
  country: index === 6 ? "Canada" : "India",
}));

const columns: DataTableColumn<Row>[] = [
  { id: "name", header: "Name", value: (row) => row.name },
  { id: "country", header: "Country", value: (row) => row.country },
];

function renderTable() {
  render(
    <DataTable
      caption="Applicants"
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      searchPlaceholder="Search applicants"
      exportFileName="applicants.csv"
      pageSize={5}
    />,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DataTable", () => {
  it("searches across columns and resets pagination", async () => {
    const user = userEvent.setup();
    renderTable();

    expect(screen.getByText("Showing 1-5 of 7")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Applicant 7")).toBeVisible();

    await user.type(screen.getByRole("searchbox"), "Canada");

    expect(screen.getByText("Showing 1-1 of 1")).toBeVisible();
    expect(screen.getByText("Applicant 7")).toBeVisible();
    expect(screen.getByText("Page 1 of 1")).toBeVisible();
  });

  it("exports the filtered rows as a CSV download", async () => {
    const user = userEvent.setup();
    const createObjectUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:csv");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    renderTable();

    await user.type(screen.getByRole("searchbox"), "Canada");
    await user.click(screen.getByRole("button", { name: "Export as CSV" }));

    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    const blob = createObjectUrl.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);
    if (!(blob instanceof Blob)) throw new Error("CSV Blob was not created");
    await expect(blob.text()).resolves.toContain("Applicant 7,Canada");
  });
});
