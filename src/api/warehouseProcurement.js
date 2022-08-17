/**
 * 封装 仓库采购   相关api
 */
import request from '@/utils/request'

/**
 * 获取物料标签配置
 */
export function get_material_tag_names(obj) {
  return request({
    url: 'warehouse/get_material_tag_names',
    method: 'post',
    data: obj
  })
}

/**
 * 物料标签自动补全
 */
export function material_tags_auto_complete(obj) {
  return request({
    url: 'warehouse/material_tags_auto_complete',
    method: 'post',
    data: obj
  })
}

/**
 *条件查询物料库存
 */
export function filter_warehouse_material(obj) {
  return request({
    url: 'warehouse/filter_warehouse_material',
    method: 'post',
    data: obj
  })
}

/**
 *添加物料库存信息
 */
export function add_warehouse_matetial(obj) {
  return request({
    url: 'warehouse/add_warehouse_matetial',
    method: 'post',
    data: obj
  })
}

/**
 * 修改物料库存信息
 */
export function edit_warehouse_material_by_id(obj) {
  return request({
    url: 'warehouse/edit_warehouse_material_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 提交入库事件
 */
export function inventory_change_via_operation(obj) {
  return request({
    url: 'warehouse/inventory_change_via_operation',
    method: 'post',
    data: obj
  })
}

/**
 * 删除物料库存信息
 */
export function delete_warehouse_material_by_id(obj) {
  return request({
    url: 'warehouse/delete_warehouse_material_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询库存操作事件记录
 */
export function filter_warehouse_material_event(obj) {
  return request({
    url: 'warehouse/filter_warehouse_material_event',
    method: 'post',
    data: obj
  })
}

/**
 * 删除物料操作事件记录
 */
export function delete_warehouse_material_event_by_id(obj) {
  return request({
    url: 'warehouse/delete_warehouse_material_event_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 获取物料库存信息详情
 */
export function get_warehouse_material_by_id(obj) {
  return request({
    url: 'warehouse/get_warehouse_material_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 根据采购单生成入库API的输入值
 */
export function generate_enter_inventory_by_purchase_note(obj) {
  return request({
    url: 'warehouse/generate_enter_inventory_by_purchase_note',
    method: 'post',
    data: obj
  })
}

/**
 * 条件查询采购单
 */
export function filter_purchase_note(obj) {
  return request({
    url: 'warehouse/filter_purchase_note',
    method: 'post',
    data: obj
  })
}

/**
 * 修改采购单
 */
export function edit_purchase_note_by_id(obj) {
  return request({
    url: 'warehouse/edit_purchase_note_by_id',
    method: 'post',
    data: obj
  })
}

/**
 * 根据生产单生成出库API的输入值
 */
export function generate_exit_inventory_by_product_note(obj) {
  return request({
    url: 'warehouse/generate_exit_inventory_by_product_note',
    method: 'post',
    data: obj
  })
}

/**
 * 添加采购单
 */
export function add_purchase_note(obj) {
  return request({
    url: 'warehouse/add_purchase_note',
    method: 'post',
    data: obj
  })
}

/**
 * 通过未排产订单列表生成“添加采购单”的API输入
 */
export function generate_purchase_note_input_by_order_list(obj) {
  return request({
    url: 'warehouse/generate_purchase_note_input_by_order_list',
    method: 'post',
    data: obj
  })
}

