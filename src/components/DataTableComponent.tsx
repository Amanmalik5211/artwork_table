import React, { useState, useEffect } from "react";
import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import './DataTableComponent.css';

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const DataTableComponent: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [first, setFirst] = useState(0);

  const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const pageSize = 10;

  const fetchArtworks = async (page: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${pageSize}`
      );
      const data = response.data;
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onPageChange = (event: DataTablePageEvent) => {
    const newPage = (event.page ?? 0) + 1;
    setFirst(event.first ?? 0);
    fetchArtworks(newPage);
  };

  const handleRowSelection = async () => {
    if (!rowsToSelect || rowsToSelect <= 0) return;

    const rowsToFetch = rowsToSelect;
    const allSelectedRows: Artwork[] = [];
    let rowsFetched = 0;
    let currentPage = 1;

    while (rowsFetched < rowsToFetch) {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${pageSize}`
      );
      const currentPageRows: Artwork[] = response.data.data;

      const rowsToAdd = Math.min(rowsToSelect - rowsFetched, currentPageRows.length);
      allSelectedRows.push(...currentPageRows.slice(0, rowsToAdd));

      rowsFetched += rowsToAdd;
      currentPage++;
    }

    setSelectedArtworks(allSelectedRows);
  };

  const titleHeaderTemplate = (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <i
        className={classNames("pi pi-chevron-down", {
          "pi-chevron-up": showDropdown,
        })}
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ fontSize: "1.3rem", cursor: "pointer", transition: "transform 0.3s" }}
      ></i>
      <span style={{ fontSize: "1.125rem", fontWeight: "500", color: "#4B5563" }}>Title</span>
      {showDropdown && (
        <div style={{ position: "absolute", top: "73px", left: "35", backgroundColor: "#F3F4F6", padding: "12px", borderRadius: "8px", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <InputNumber
              value={rowsToSelect}
              onValueChange={(e) => setRowsToSelect(e.value ?? null)}
              placeholder="Rows"
              min={1}
              className="w-full"
            />
            <Button
              label="Submit"
              onClick={() => {
                handleRowSelection();
                setShowDropdown(false); 
                setRowsToSelect(null); 
              }}
              className="bg-blue-500 border-blue-500  pl-2"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="table-container">
      <h2 className="table-title">Artworks Table</h2>

      <div className="data-table-container">
        <DataTable
          value={artworks}
          paginator
          rows={pageSize}
          totalRecords={totalRecords}
          lazy
          loading={loading}
          first={first}
          onPage={onPageChange}
          selection={selectedArtworks}
          onSelectionChange={(e: { value: Artwork[] }) => setSelectedArtworks(e.value)}
          dataKey="id"
          selectionMode="checkbox"
          className="artworks-table"
        >
          <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
          <Column field="title" header={titleHeaderTemplate} />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Start Date" />
          <Column field="date_end" header="End Date" />
        </DataTable>
      </div>

      <div className="selected-artworks-container">
        <h3 className="selected-artworks-heading">Selected Artworks</h3>
        <ul style={{ listStyleType: "none", padding: "0", marginTop: "0" }}>
          {selectedArtworks.map((artwork) => (
            <li key={artwork.id} className="selected-artwork-item">
              <span className="selected-artwork-bullet"></span>
              <span className="selected-artwork-title"> Title :</span>
              <span className="selected-artwork-title">{artwork.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DataTableComponent;
