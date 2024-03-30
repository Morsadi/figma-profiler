import React from 'react';

const StylesPreview = ({ currentStyle }) => {
    return (
        <div>

            <div className="style-preview-container">
                {currentStyle ? (
                    <div>
                        {/* Render the style properties */}
                        {Object.entries(currentStyle).map(([property, value]) => (
                            <div key={property} className="style-property">
                                <span className="property-name">{property}:</span>
                                <span className="property-value">{value}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No style selected.</p>
                )}
            </div>
        </div>
    );
};

export default StylesPreview;
