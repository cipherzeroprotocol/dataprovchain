import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ThemeContext } from '../../contexts/ThemeContext';

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  rowClassName = '',
  headerClassName = '',
  bodyClassName = ''
}) => {
  // Get theme context
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme.name === 'dark' || 
    (theme.name === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const renderHeader = () => {
    return (
      <thead className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-500'} ${headerClassName}`}>
        <tr>
          {columns.map((column, index) => (
            <th
              key={index}
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ width: column.width }}
            >
              {column.title}
            </th>
          ))}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tbody className={isDarkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}>
          <tr>
            <td colSpan={columns.length} className="px-6 py-4 text-center">
              <div className="flex justify-center">
                <svg className={`animate-spin h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    if (!data.length) {
      return (
        <tbody className={isDarkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'}>
          <tr>
            <td colSpan={columns.length} className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody className={`${isDarkMode ? 'bg-gray-700 divide-y divide-gray-600' : 'bg-white divide-y divide-gray-200'} ${bodyClassName}`}>
        {data.map((item, rowIndex) => (
          <tr
            key={rowIndex}
            className={`${onRowClick ? `cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'}` : ''} ${rowClassName}`}
            onClick={onRowClick ? () => onRowClick(item, rowIndex) : undefined}
          >
            {columns.map((column, colIndex) => (
              <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-200' : ''}`}>
                {column.render ? column.render(item, rowIndex) : item[column.dataIndex]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full ${isDarkMode ? 'divide-y divide-gray-600' : 'divide-y divide-gray-200'} ${className}`}>
        {renderHeader()}
        {renderBody()}
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node.isRequired,
      dataIndex: PropTypes.string,
      render: PropTypes.func,
      width: PropTypes.string
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.node,
  onRowClick: PropTypes.func,
  className: PropTypes.string,
  rowClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string
};

export default Table;
