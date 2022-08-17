/**
 * 封装产品库/工艺/部位维护   相关api
 */
import request from '@/utils/request'

/**
 * 获取产品标签配置
 */
export function get_product_tag_names(obj) {
  return request({
    url: 'product/get_product_tag_names',
    method: 'post',
    data: obj
  })
}

/**
 * 产品标签自动补全
 */
export function product_tags_auto_complete(obj) {
  return request({
    url: 'product/product_tags_auto_complete',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询产品信息
 */
export function filter_product(obj) {
  return request({
    url: 'product/filter_product',
    method: 'post',
    data: obj
  })
}

/**
 * 删除产品
 */
export function delete_product_by_id(obj) {
  return request({
    url: 'product/delete_product_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获得产品信息详情
 */
export function get_product_by_id(obj) {
  return request({
    url: 'product/get_product_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询工序信息
 */
export function filter_process(obj) {
  return request({
    url: 'process/filter_process',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询部位信息
 */
export function filter_component(obj) {
  return request({
    url: 'component/filter_component',
    method: 'post',
    data: obj
  })
}

/**
 * 修改产品信息
 */
export function edit_product_by_id(obj) {
  return request({
    url: 'product/edit_product_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 添加产品信息
 */
export function add_product(obj) {
  return request({
    url: 'product/add_product',
    method: 'post',
    data: obj
  })
}

/**
 * 添加工序信息
 */
export function add_process(obj) {
  return request({
    url: 'process/add_process',
    method: 'post',
    data: obj
  })
}
/**
 * 编辑工序信息
 */
export function edit_process_by_id(obj) {
  return request({
    url: 'process/edit_process_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 提高工序排名
 */
export function increase_process_by_id(obj) {
  return request({
    url: 'process/increase_process_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 降低工序排名
 */
export function decrease_process_by_id(obj) {
  return request({
    url: 'process/decrease_process_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 删除工序信息
 */
export function delete_process_by_id(obj) {
  return request({
    url: 'process/delete_process_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 添加部位信息
 */
export function add_component(obj) {
  return request({
    url: 'component/add_component',
    method: 'post',
    data: obj
  })
}

/**
 * 修改部位信息
 */
export function edit_component_by_id(obj) {
  return request({
    url: 'component/edit_component_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 删除部位信息
 */
export function delete_component_by_id(obj) {
  return request({
    url: 'component/delete_component_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 提高部位排名
 */
export function increase_component_by_id(obj) {
  return request({
    url: 'component/increase_component_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 降低部位排名
 */
export function decrease_component_by_id(obj) {
  return request({
    url: 'component/decrease_component_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 返回给该供应商送货单中的产品名称
 */
export function get_supplier_goods(obj) {
  return request({
    url: 'product/get_supplier_goods',
    method: 'post',
    data: obj
  })
}

/**
 * 获得企业对应供应商的产品的价格
 */
export function get_supplier_goods_price(obj) {
  return request({
    url: 'product/get_supplier_goods_price',
    method: 'post',
    data: obj
  })
}

/**
 * 根据用户指定的标签来匹配出最相近的三条产品信息
 */
export function filter_nearest_product_appoint_tags(obj) {
  return request({
    url: 'product/filter_nearest_product_appoint_tags',
    method: 'post',
    data: obj
  })
}
