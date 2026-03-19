import React, { useState, useEffect, useRef } from 'react';

const fontOptions = [
  { label: 'Default', value: '' },
  { label: 'Sans Serif', value: 'ui-sans-serif, system-ui' },
  { label: 'Serif', value: 'ui-serif, Georgia' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular' },
  { label: 'Display (Oswald)', value: 'Oswald, sans-serif' },
  { label: 'Modern (Montserrat)', value: 'Montserrat, sans-serif' },
  { label: 'Elegant (Playfair)', value: 'Playfair Display, serif' },
  { label: 'Round (Quicksand)', value: 'Quicksand, sans-serif' }
];

const VisualEditor = (props) => {
  const { 
    item, 
    siteStructure, 
    selectedSite, 
    onSave, 
    onCancel, 
    onUpload,
    // Section Management Props
    onMoveSection,
    onToggleSection,
    onUpdateLayout,
    onUpdatePadding,
    onAddItem,
    onDeleteItem,
    onMoveField,
    onToggleField,
    onToggleInline
  } = props;

  const labelRef = useRef(null);
  const urlRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [value, setValue] = useState('');
  
  // --- SECTION MANAGER STATE ---
  const [activeView, setActiveProjectView] = useState('sections'); // 'sections', 'settings', 'fields', 'items'
  const [selectedSection, setSelectedSection] = useState(null);

  const initialValueData = item?.value || item?.currentValue || '';
  const dockType = item?.type || item?.dockType || item?.dataType || 'text';
  const isSectionManager = dockType === 'SECTION_MANAGER';
  const isLink = dockType === 'link';
  const isMedia = dockType === 'media' || (!isLink && item?.binding?.key?.toLowerCase().includes('image'));

  const [linkData, setLinkData] = useState({ label: '', url: '' });
  const [textStyles, setTextStyles] = useState({
    color: typeof initialValueData === 'object' ? (initialValueData.color || '') : '',
    fontSize: typeof initialValueData === 'object' ? (initialValueData.fontSize || '') : '',
    fontWeight: typeof initialValueData === 'object' ? (initialValueData.fontWeight || 'normal') : 'normal',
    fontStyle: typeof initialValueData === 'object' ? (initialValueData.fontStyle || 'normal') : 'normal',
    textAlign: typeof initialValueData === 'object' ? (initialValueData.textAlign || 'left') : 'left',
    fontFamily: typeof initialValueData === 'object' ? (initialValueData.fontFamily || '') : '',
    shadowX: typeof initialValueData === 'object' ? (initialValueData.shadowX || 0) : 0,
    shadowY: typeof initialValueData === 'object' ? (initialValueData.shadowY || 0) : 0,
    shadowBlur: typeof initialValueData === 'object' ? (initialValueData.shadowBlur || 0) : 0,
    shadowColor: typeof initialValueData === 'object' ? (initialValueData.shadowColor || 'rgba(0,0,0,0.5)') : 'rgba(0,0,0,0.5)',
    paddingTop: typeof initialValueData === 'object' ? (initialValueData.paddingTop || 0) : 0,
    paddingBottom: typeof initialValueData === 'object' ? (initialValueData.paddingBottom || 0) : 0
  });

  // 🔱 v8.8 On-Demand Sync logica
  const requestSync = () => {
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow && item?.binding) {
      iframe.contentWindow.postMessage({
        type: 'DOCK_REQUEST_SYNC',
        file: item.binding.file,
        index: item.binding.index,
        key: item.binding.key
      }, '*');
    }
  };

  useEffect(() => {
    if (isSectionManager) {
        setIsLoaded(true);
        return;
    }
    if (typeof initialValueData === 'object') {
        setValue(initialValueData.text || initialValueData.label || initialValueData.title || '');
    } else {
        setValue(initialValueData);
    }
  }, [initialValueData, isSectionManager]);

  useEffect(() => {
    if (isSectionManager) return;
    const handleSyncResponse = (event) => {
      const { type, key, value: siteValue } = event.data;
      if (type === 'SITE_SYNC_RESPONSE' && key === item?.binding?.key) {
        if (isLink) {
          const foundUrl = (typeof siteValue === 'object' && siteValue !== null) ? siteValue.url : siteValue;
          const foundLabel = (typeof siteValue === 'object' && siteValue !== null) ? siteValue.label : siteValue;
          setLinkData({ label: foundLabel || '', url: foundUrl || '' });
        } else if (!isMedia) {
          if (typeof siteValue === 'object' && siteValue !== null) {
            setValue(siteValue.text || siteValue.title || siteValue.label || siteValue.name || siteValue.value || '');
            setTextStyles(prev => ({ ...prev, ...siteValue }));
          } else {
            setValue(siteValue || '');
          }
        }
        setIsLoaded(true);
      }
    };
    window.addEventListener('message', handleSyncResponse);
    const timer = setTimeout(requestSync, 100);
    return () => { window.removeEventListener('message', handleSyncResponse); clearTimeout(timer); };
  }, [item?.binding?.key, isLink, isMedia, isSectionManager]);

  const handleSave = () => {
    let finalData;
    if (isLink) {
      finalData = { label: labelRef.current.value, url: urlRef.current.value };
    } else if (isMedia) {
      finalData = value;
    } else {
      finalData = { text: value, ...textStyles };
    }
    onSave(finalData, {});
  };

  const getSectionSetting = (sectionId, property, defaultValue = null) => {
    const settings = siteStructure?.data?.section_settings;
    if (!settings) return defaultValue;
    if (Array.isArray(settings)) {
      const found = settings.find(s => s.id === sectionId);
      return (found && found[property] !== undefined) ? found[property] : defaultValue;
    }
    const found = settings[sectionId];
    return (found && found[property] !== undefined) ? found[property] : defaultValue;
  };

  // --- RENDERING HELPERS ---

  const renderSectionList = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <h4 className="font-black uppercase text-xs tracking-widest text-slate-400">Page Sections</h4>
        <span className="text-[10px] font-bold text-slate-300 italic">Total: {siteStructure?.sections?.length || 0} sections detected</span>
      </div>
      {(siteStructure?.sections || []).map((section, idx) => (
        <div key={section} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded shadow-sm hover:border-blue-300 transition-all group">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-slate-300 w-4">{idx + 1}</span>
            <span className="text-sm font-bold text-slate-700 capitalize">{section.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onToggleSection(section)}
              className={`p-2 w-10 h-10 flex items-center justify-center rounded border ${getSectionSetting(section, 'visible') === false ? 'bg-slate-50 text-slate-300 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
              title="Toggle Visibility"
            >
              <i className={`fa-solid ${getSectionSetting(section, 'visible') === false ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            <div className="flex border border-slate-200 rounded overflow-hidden">
                <button onClick={() => onMoveSection(section, 'up')} className="p-2 w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-400 border-r border-slate-200"><i className="fa-solid fa-arrow-up text-[10px]"></i></button>
                <button onClick={() => onMoveSection(section, 'down')} className="p-2 w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-400"><i className="fa-solid fa-arrow-down text-[10px]"></i></button>
            </div>
            <button 
              onClick={() => { setSelectedSection(section); setActiveProjectView('settings'); }}
              className="ml-2 px-6 py-2 bg-slate-800 text-white text-[10px] font-black uppercase rounded hover:bg-blue-600 transition-colors h-10"
            >
              Configure
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSectionSettings = () => (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-200">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveProjectView('sections')} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full"><i className="fa-solid fa-arrow-left"></i></button>
        <h4 className="text-xl font-black uppercase tracking-tighter text-slate-800">Settings: <span className="text-blue-600 capitalize">{selectedSection.replace(/_/g, ' ')}</span></h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-6">
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Layout Pattern</label>
                <div className="grid grid-cols-2 gap-2">
                    {['grid', 'list', 'z-pattern', 'focus'].map(l => (
                        <button 
                            key={l}
                            onClick={() => onUpdateLayout(selectedSection, l)}
                            className={`py-3 text-[10px] font-bold rounded border uppercase ${siteStructure?.layouts?.[selectedSection] === l ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'}`}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-3">Vertical Padding (y)</label>
                <input 
                    type="range" min="0" max="120" step="8"
                    value={getSectionSetting(selectedSection, 'padding') || 32}
                    onChange={(e) => onUpdatePadding(selectedSection, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-2 font-mono text-[10px] text-slate-400">
                    <span>MIN</span>
                    <span className="font-bold text-blue-600">{getSectionSetting(selectedSection, 'padding') || 32}px</span>
                    <span>MAX</span>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <button 
                onClick={() => setActiveProjectView('fields')}
                className="w-full p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-list-check text-xl"></i>
                    </div>
                    <div>
                        <p className="font-black uppercase text-xs">Field Management</p>
                        <p className="text-[10px] text-slate-400">Show/hide and reorder specific data fields.</p>
                    </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-300"></i>
            </button>

            <button 
                onClick={() => setActiveProjectView('items')}
                className="w-full p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-500 transition-all flex items-center justify-between group"
            >
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <i className="fa-solid fa-boxes-stacked text-xl"></i>
                    </div>
                    <div>
                        <p className="font-black uppercase text-xs">Item Management</p>
                        <p className="text-[10px] text-slate-400">Add, remove or sort records in this section.</p>
                    </div>
                </div>
                <i className="fa-solid fa-chevron-right text-slate-300"></i>
            </button>
        </div>
      </div>
    </div>
  );

  const renderFieldManager = () => {
    const fields = (siteStructure?.data?.[selectedSection]?.[0] ? Object.keys(siteStructure.data[selectedSection][0]) : [])
        .filter(k => !['absoluteIndex', '_hidden', 'id', 'pk', 'uuid'].some(tf => k.toLowerCase().includes(tf)))
        .filter(k => !k.toLowerCase().includes('foto') && !k.toLowerCase().includes('image'))
        .sort((a, b) => {
            const order = siteStructure?.data?.display_config?.sections?.[selectedSection]?.visible_fields || [];
            const idxA = order.indexOf(a);
            const idxB = order.indexOf(b);
            if (idxA === -1 && idxB === -1) return 0;
            if (idxA === -1) return 1;
            if (idxB === -1) return -1;
            return idxA - idxB;
        });

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveProjectView('settings')} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full"><i className="fa-solid fa-arrow-left"></i></button>
                <h4 className="text-xl font-black uppercase tracking-tighter text-slate-800">Fields: <span className="text-blue-600 capitalize">{selectedSection.replace(/_/g, ' ')}</span></h4>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {fields.map(field => {
                    const displayConfig = siteStructure?.data?.display_config || { sections: {} };
                    const config = displayConfig.sections?.[selectedSection] || { visible_fields: [], hidden_fields: [] };
                    const isHidden = Array.isArray(config.hidden_fields) && config.hidden_fields.includes(field);
                    const isInline = Array.isArray(config.inline_fields) && config.inline_fields.includes(field);

                    return (
                        <div key={field} className="flex items-center justify-between p-3 bg-white border border-slate-100 mb-1 rounded shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold ${!isHidden ? 'text-slate-700' : 'text-slate-300 line-through'}`}>{field}</span>
                                {isInline && <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Inline</span>}
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => onMoveField(selectedSection, field, 'up')} className="p-2 w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-400 rounded"><i className="fa-solid fa-chevron-up text-[10px]"></i></button>
                                <button onClick={() => onMoveField(selectedSection, field, 'down')} className="p-2 w-8 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-400 rounded"><i className="fa-solid fa-chevron-down text-[10px]"></i></button>
                                <div className="w-px h-4 bg-slate-100 mx-1"></div>
                                <button onClick={() => onToggleField(selectedSection, field)} className={`p-2 w-8 h-8 flex items-center justify-center rounded ${!isHidden ? 'text-green-500 bg-green-50' : 'text-slate-300'}`}><i className={`fa-solid ${!isHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i></button>
                                <button onClick={() => onToggleInline(selectedSection, field)} className={`p-2 w-8 h-8 flex items-center justify-center rounded ${isInline ? 'text-purple-500 bg-purple-50' : 'text-slate-300'}`} title="Toggle Inline Placement"><i className="fa-solid fa-level-down-alt"></i></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderItemManager = () => {
    const items = siteStructure?.data?.[selectedSection] || [];
    const extractTitle = (item, idx) => {
        const val = item.naam || item.titel || item.header || item.kop || item.label || Object.values(item).find(v => typeof v === 'string' && v.length < 40);
        return (typeof val === 'object' ? val.text : val) || `Item ${idx + 1}`;
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveProjectView('settings')} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full"><i className="fa-solid fa-arrow-left"></i></button>
                    <h4 className="text-xl font-black uppercase tracking-tighter text-slate-800">Items: <span className="text-blue-600 capitalize">{selectedSection.replace(/_/g, ' ')}</span></h4>
                </div>
                <button onClick={() => onAddItem(selectedSection)} className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">Add New Record</button>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {items.map((itemData, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 mb-1 rounded shadow-sm group">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-300 w-4 text-center">{idx + 1}</span>
                            <span className="text-sm font-bold text-slate-600 truncate max-w-[400px]">{extractTitle(itemData, idx)}</span>
                        </div>
                        <button 
                            onClick={() => onDeleteItem(selectedSection, idx)}
                            className="p-2 w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Delete Record"
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                ))}
                {items.length === 0 && <p className="p-10 text-center text-slate-400 italic">No records found in this section.</p>}
            </div>
        </div>
    );
  };

  // --- MAIN MODAL WRAPPER ---

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className={`bg-white rounded shadow-2xl overflow-hidden border border-slate-400 animate-in zoom-in duration-150 flex flex-col ${isSectionManager ? 'w-full max-w-4xl h-[85vh]' : 'w-full max-w-2xl max-h-[90vh]'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <i className={`fa-solid ${isSectionManager ? 'fa-sliders' : 'fa-pen-to-square'} text-blue-600`}></i>
            {isSectionManager ? 'Section Manager v8.5' : `Editor: ${item?.binding?.key || 'Element'}`}
          </h3>
          <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><i className="fa-solid fa-xmark text-xl"></i></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {!isLoaded && !isSectionManager ? (
            <div className="flex flex-col items-center justify-center h-60 gap-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black uppercase text-[10px] text-slate-400 tracking-widest">Fetching from Bridge...</p>
            </div>
          ) : isSectionManager ? (
            <>
              {activeView === 'sections' && renderSectionList()}
              {activeView === 'settings' && renderSectionSettings()}
              {activeView === 'fields' && renderFieldManager()}
              {activeView === 'items' && renderItemManager()}
            </>
          ) : isLink ? (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Button Label</label>
                    <input ref={labelRef} type="text" defaultValue={linkData.label} className="w-full p-4 bg-slate-50 border border-slate-300 rounded font-bold outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">URL / Target</label>
                    <input ref={urlRef} type="text" defaultValue={linkData.url} className="w-full p-4 bg-slate-50 border border-slate-300 rounded font-mono text-sm outline-none focus:border-blue-500 text-blue-600" />
                </div>
            </div>
          ) : isMedia ? (
            <div className="space-y-6">
                <div className="aspect-video bg-slate-50 rounded overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center group relative">
                    {value ? <img src={value.startsWith('http') ? value : `${selectedSite?.url}/images/${value}`} alt="Preview" className="max-h-full object-contain" /> : <p className="text-slate-400">No Image Selected</p>}
                    <label className="absolute inset-0 flex items-center justify-center bg-blue-600/80 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-black uppercase text-xs tracking-widest">
                        <i className="fa-solid fa-upload mr-2"></i> Upload New Image
                        <input type="file" className="hidden" onChange={async (e) => {
                            const file = e.target.files[0];
                            const res = await fetch(`${selectedSite?.url}/__athena/upload`, { method: 'POST', headers: { 'X-Filename': file.name }, body: file });
                            const data = await res.json();
                            if (data.success) setValue(data.filename);
                        }} accept="image/*" />
                    </label>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Filename</label>
                    <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-500" />
                </div>
            </div>
          ) : (
            <div className="space-y-6">
                <div className="bg-slate-50 border border-slate-300 rounded overflow-hidden">
                    <div className="grid grid-cols-2 divide-x divide-slate-200">
                        <div className="p-6 space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Typography</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <select 
                                        value={textStyles.fontFamily} 
                                        onChange={(e) => setTextStyles(s => ({ ...s, fontFamily: e.target.value }))}
                                        className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-bold appearance-none cursor-pointer"
                                    >
                                        {fontOptions.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                    </select>
                                    <i className="fa-solid fa-chevron-down absolute right-2 top-3 text-[8px] text-slate-400 pointer-events-none"></i>
                                </div>
                                <input type="number" value={parseInt(textStyles.fontSize)} onChange={(e) => setTextStyles(s => ({ ...s, fontSize: e.target.value }))} className="w-16 p-2 border border-slate-300 rounded font-bold text-xs" placeholder="PX" />
                            </div>
                            <div className="flex gap-2">
                                <input type="color" value={textStyles.color || '#000000'} onChange={(e) => setTextStyles(s => ({ ...s, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-slate-300 bg-white p-1" />
                                <div className="flex border border-slate-300 rounded overflow-hidden flex-1">
                                    <button onClick={() => setTextStyles(s => ({ ...s, fontWeight: s.fontWeight === 'bold' ? 'normal' : 'bold' }))} className={`flex-1 py-2 text-xs font-black ${textStyles.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50'}`}>B</button>
                                    <button onClick={() => setTextStyles(s => ({ ...s, fontStyle: s.fontStyle === 'italic' ? 'normal' : 'italic' }))} className={`flex-1 py-2 text-xs italic font-serif ${textStyles.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50'}`}>I</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Alignment & Layout</label>
                            <div className="flex border border-slate-300 rounded overflow-hidden">
                                {['left', 'center', 'right', 'justify'].map(a => (
                                    <button key={a} onClick={() => setTextStyles(s => ({ ...s, textAlign: a }))} className={`flex-1 py-2 text-xs ${textStyles.textAlign === a ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50'}`}><i className={`fa-solid fa-align-${a}`}></i></button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400">Pad Top</label>
                                    <input type="number" value={textStyles.paddingTop} onChange={(e) => setTextStyles(s => ({ ...s, paddingTop: parseInt(e.target.value) }))} className="w-full p-2 border border-slate-300 rounded text-xs font-bold" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-slate-400">Pad Bottom</label>
                                    <input type="number" value={textStyles.paddingBottom} onChange={(e) => setTextStyles(s => ({ ...s, paddingBottom: parseInt(e.target.value) }))} className="w-full p-2 border border-slate-300 rounded text-xs font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <textarea 
                    value={value} 
                    onChange={(e) => setValue(e.target.value)} 
                    className="w-full p-8 bg-slate-50 border border-slate-300 rounded min-h-[250px] font-bold outline-none focus:border-blue-500 text-xl shadow-inner leading-relaxed"
                    style={{ 
                        color: textStyles.color, 
                        textAlign: textStyles.textAlign, 
                        fontWeight: textStyles.fontWeight, 
                        fontStyle: textStyles.fontStyle,
                        fontFamily: textStyles.fontFamily,
                        paddingTop: `${textStyles.paddingTop}px`,
                        paddingBottom: `${textStyles.paddingBottom}px`,
                        textShadow: textStyles.shadowBlur > 0 ? `${textStyles.shadowX}px ${textStyles.shadowY}px ${textStyles.shadowBlur}px ${textStyles.shadowColor}` : 'none'
                    }}
                    placeholder="Enter text content..."
                />
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSectionManager && (
            <div className="p-6 bg-white border-t border-slate-200 flex justify-end gap-4 shrink-0">
                <button onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:underline text-xs uppercase tracking-widest">Discard</button>
                <button onClick={handleSave} className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded shadow-xl uppercase text-xs tracking-widest active:scale-95 transition-all">Save Changes</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default VisualEditor;
