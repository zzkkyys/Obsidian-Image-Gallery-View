const buildVertical = (
  container: HTMLElement,
  imagesList: {[key: string]: any},
  settings: {[key: string]: any}
) => {
  // inject the gallery wrapper
  const gallery = container.createEl('div')
  gallery.addClass('grid-wrapper')
  gallery.style.lineHeight = '0px'
  gallery.style.columnCount = `${settings.columns}`
  gallery.style.columnGap = `${settings.gutter}px`

  // inject and style images
  imagesList.forEach((file: {[key: string]: string}) => {
    // 创建一个包装器，用于保持图片和名称在同一列
    const wrapper = gallery.createEl('div')
    wrapper.addClass('image-wrapper')
    wrapper.style.marginBottom = `${settings.gutter}px`
    wrapper.style.width = '100%'
    wrapper.style.breakInside = 'avoid' // 防止在列布局中被分割
    wrapper.style.display = 'block' // 确保块级显示

    // 创建网格项作为lightbox的触发元素
    const figure = wrapper.createEl('div')
    figure.addClass('grid-item')
    figure.style.width = '100%'
    figure.style.height = 'auto'
    figure.style.cursor = 'pointer'
    figure.setAttribute('data-name', file.name)
    figure.setAttribute('data-folder', file.folder)
    // 重要：确保data-src属性正确设置
    figure.setAttribute('data-src', file.uri)
    // 添加子标题数据
    figure.setAttribute('data-sub-html', `<h4>${file.name}</h4>`)

    const img = figure.createEl('img')
    img.style.borderRadius = `${settings.radius}px`
    img.style.width = '100%' // 确保图片填满容器宽度
    img.loading = 'lazy'
    img.decoding = 'async'
    img.src = file.uri
    
    if (settings.border) {
      img.style.border = `${settings.borderWidth}px ${settings.borderType} ${settings.borderColor}`
      img.style.boxSizing = 'border-box'
    }

    // 添加图片名称 - 单行显示并悬停显示全称
    if (settings.showName) {
      // 将名称作为figure的子元素
      const nameEl = figure.createEl('div')
      nameEl.addClass('img-name')
      nameEl.textContent = file.name
      nameEl.title = file.name // 添加title属性以在悬停时显示全名
      
      // 样式设置
      nameEl.style.display = 'block'
      nameEl.style.textAlign = 'center'
      nameEl.style.padding = '2px'
      nameEl.style.fontSize = '0.85rem'
      nameEl.style.lineHeight = '1.2'
      nameEl.style.color = 'var(--text-normal)'
      nameEl.style.backgroundColor = 'var(--background-secondary)'
      nameEl.style.width = '100%'
      nameEl.style.boxSizing = 'border-box'
      
      // 单行文本设置
      nameEl.style.whiteSpace = 'nowrap'
      nameEl.style.overflow = 'hidden'
      nameEl.style.textOverflow = 'ellipsis'
    }
  })

  return gallery
}

export default buildVertical