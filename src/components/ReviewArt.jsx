import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArtCard from "./ArtCard";
import TopPanel from "./TopPanel";
import ListView from "./ListView";
import { getAllImages, getAllImagesStats } from "../api/API";

import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import "@styles/reviewart.css";

function ReviewArt() {
    const DEFAULT_PAGE = 1;  
    const DEFAULT_PAGE_SIZE = 50;
    const DELAY_TIME = 500;

    const navigate = useNavigate();
    const { authState } = useAuth();

    const [page, setPage] = useState(DEFAULT_PAGE);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);

    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const [viewMode, setViewMode] = useState("grid");
    
    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    
    // Active filter state for visual feedback
    const [activeFilter, setActiveFilter] = useState('all');

    // apply debounced query w/ a delay every time search input changes
    const [queryString, setQueryString] = useState('');
    const debouncedQuery = useDebounce({ value: queryString, delay: DELAY_TIME });
    const [queryStage, setQueryStage] = useState('');

    // Fetch stats
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await getAllImagesStats(authState.token);
            setStats({
                total: response.stats.total,
                pending: response.stats.pending,
                approved: response.stats.approved,
                rejected: response.stats.rejected
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    // call fetch API
    const fetchArts = async() => {
        try {
            const query = {
                input: debouncedQuery,
                stage: queryStage,
            }
            const response = await getAllImages(authState.token, page, pageSize, query);

            // update arts & pagination metadata
            setArtworks(response.images || []);
            setTotalPages(response.pagination?.totalPages || 1);
        } catch (error) {
            console.error("Error fetching artworks:", error);
            setArtworks([]);
            setTotalPages(1);
        }
    }

    // ✅ reset page when searching something new
    useEffect(() => {
        setPage(1);
    }, [debouncedQuery]);

    // Fetch stats on component mount and when filter changes
    useEffect(() => {
        if (authState?.token) {
            fetchStats();
        }
    }, [authState?.token, queryStage]);

    // ✅ fetch data when token, pagination metadata or query updates
    useEffect(() => {
        const fetchData = async () => {
            if (!authState || !authState.token) {
                navigate("/login");
                return;
            }

            setLoading(true);
            await fetchArts();
            setLoading(false);
        };

        fetchData();
    }, [authState?.token, page, pageSize, queryStage, debouncedQuery]);

    // ✅ Select a new page
    const handlePageChange = (value) => {
        if(value < 0 || value > totalPages+1){
            return;
        }
        setPage(value);  
    };

    // ✅ Select #items to display per page
    const handlePageSizeChange = (e) => {
        setPageSize(e.target.value);
        setPage(1);
    };

    // helper function to filter arts (update query before fetch)
    const handleFilterArts = (stage, filterName) => {
        setQueryStage(stage);
        setActiveFilter(filterName);
        setPage(1);
    };

    // ✅ Show All Artworks (Reset Filter)
    const handleShowAllArt = () => {
        handleFilterArts('', 'all');
    };

    // ✅ Filtering Functions
    const handleFilterPending = () => {
        handleFilterArts('review', 'pending');
    };

    const handleFilterApproved = () => {
        handleFilterArts('approved', 'approved');
    };

    const handleFilterRejected = () => {
        handleFilterArts('rejected', 'rejected');
    };

    // ✅ Search Functionality
    const handleSearch = (query) => {
        const lowerCaseQuery = query.trim().toLowerCase();
        setQueryString(lowerCaseQuery);
    };

    // ✅ Toggle View Mode
    const toggleViewMode = () => {
        setViewMode(viewMode === "grid" ? "list" : "grid");
    };


    // render all art & their approval status
    const renderArtStatus = () => {
        if(loading){
            return (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading artworks...</p>
                </div>
            );
        }

        if(artworks.length === 0){
            const filterText = activeFilter !== 'all' ? ` with status "${activeFilter}"` : '';
            return (
                <div className="no-results">
                    <div className="no-results-icon">🎨</div>
                    <p>No artwork found{filterText}.</p>
                    {activeFilter !== 'all' && (
                        <button className="reset-filter-btn" onClick={handleShowAllArt}>
                            Show All Artworks
                        </button>
                    )}
                </div>
            );
        }
        
        // return arts status in grid/list view
        return(
            <div className={`artworks-container artworks-container--${viewMode}`}>
                {viewMode === "grid" ? (
                    <div className="grid">
                        {artworks.map((art) => (
                            <ArtCard key={art._id} art={art} />
                        ))}
                    </div>
                ) : (
                    <ListView data={artworks} type="artworks" />
                )}
            </div>
        );
    };

    return (
        <ScreenTemplate>
            <TopPanel
                onShowAllArt={handleShowAllArt}
                onFilterPending={handleFilterPending}
                onFilterApproved={handleFilterApproved}
                onFilterRejected={handleFilterRejected}
                onSearch={handleSearch}
                viewMode={viewMode}
                toggleViewMode={toggleViewMode}
                pageSize={pageSize}
                handlePageSizeChange={handlePageSizeChange}
                activeFilter={activeFilter}
                stats={stats}
                statsLoading={statsLoading}
            />

            <div className="reviewArtsContent">
                {renderArtStatus()}
                {artworks.length > 0 && (
                    <Pagination  
                        page={page}
                        totalPages={totalPages}
                        onChange={handlePageChange}
                    />
                )}
            </div>
        </ScreenTemplate>
    );
}

export default ReviewArt;
